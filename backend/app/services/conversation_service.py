"""
Conversation service — business logic for all conversation-level operations.

Covers:
  - list_conversations        GET  /conversations
  - get_or_create_direct      POST /conversations/direct
  - create_group              POST /conversations/group
  - get_conversation_detail   GET  /conversations/{id}
  - update_conversation       PATCH /conversations/{id}
  - add_member                POST /conversations/{id}/members
  - remove_member             DELETE /conversations/{id}/members/{user_id}
"""

from __future__ import annotations

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from fastapi import HTTPException, status

from app.models.conversation import Conversation
from app.models.conversation_member import ConversationMember
from app.models.message import Message
from app.models.user import User
from app.schemas.conversation import (
    ConversationDetail,
    ConversationListItem,
    ConversationRead,
    ConversationUpdate,
    GroupConversationCreate,
)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

async def _require_member(
    db: AsyncSession, conversation_id: int, user_id: int
) -> ConversationMember:
    """Return the membership row, or raise 403."""
    result = await db.execute(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if member is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member.")
    return member


async def _require_admin(
    db: AsyncSession, conversation_id: int, user_id: int
) -> ConversationMember:
    """Return the membership row only if admin, else raise 403."""
    member = await _require_member(db, conversation_id, user_id)
    if member.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only.")
    return member


async def _get_conversation_or_404(db: AsyncSession, conversation_id: int) -> Conversation:
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.members))
        .where(Conversation.id == conversation_id)
    )
    conv = result.scalar_one_or_none()
    if conv is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    return conv


# ---------------------------------------------------------------------------
# Service functions
# ---------------------------------------------------------------------------

async def list_conversations(
    db: AsyncSession, current_user_id: int
) -> list[ConversationListItem]:
    """
    Return all conversations the current user belongs to, sorted by
    last_message_at DESC, with unread counts and last-message preview.
    """
    # Conversations the user is a member of
    membership_sq = (
        select(ConversationMember.conversation_id)
        .where(ConversationMember.user_id == current_user_id)
        .scalar_subquery()
    )

    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.members))
        .where(Conversation.id.in_(membership_sq))
        .order_by(Conversation.last_message_at.desc().nullslast())
    )
    conversations = result.scalars().all()

    items: list[ConversationListItem] = []
    for conv in conversations:
        # Find current user's membership row for last_read_message_id
        my_member = next(
            (m for m in conv.members if m.user_id == current_user_id), None
        )
        last_read_id = my_member.last_read_message_id if my_member else None

        # Unread count = incoming messages after last_read_message_id
        unread_q = select(func.count(Message.id)).where(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user_id,
            Message.is_deleted == False,  # noqa: E712
        )
        if last_read_id is not None:
            unread_q = unread_q.where(Message.id > last_read_id)
        unread_count = (await db.execute(unread_q)).scalar_one()

        # Last message preview
        last_msg_result = await db.execute(
            select(Message.content)
            .where(
                Message.conversation_id == conv.id,
                Message.is_deleted == False,  # noqa: E712
            )
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_preview = last_msg_result.scalar_one_or_none()

        items.append(
            ConversationListItem(
                id=conv.id,
                type=conv.type,
                name=conv.name,
                avatar_url=conv.avatar_url,
                created_by=conv.created_by,
                created_at=conv.created_at,
                last_message_at=conv.last_message_at,
                unread_count=unread_count,
                last_message_preview=last_preview,
            )
        )
    return items


async def get_or_create_direct(
    db: AsyncSession, current_user_id: int, other_user_id: int
) -> ConversationRead:
    """
    Get-or-create a 1:1 direct conversation between two users.
    """
    if current_user_id == other_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create a conversation with yourself.",
        )

    # Check the other user exists
    other = await db.get(User, other_user_id)
    if other is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # Find existing direct conversation shared by both users
    my_convs = select(ConversationMember.conversation_id).where(
        ConversationMember.user_id == current_user_id
    )
    other_convs = select(ConversationMember.conversation_id).where(
        ConversationMember.user_id == other_user_id
    )
    result = await db.execute(
        select(Conversation).where(
            and_(
                Conversation.type == "direct",
                Conversation.id.in_(my_convs),
                Conversation.id.in_(other_convs),
            )
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return ConversationRead.model_validate(existing)

    # Create new
    conv = Conversation(type="direct", created_by=current_user_id)
    db.add(conv)
    await db.flush()  # get conv.id

    db.add_all([
        ConversationMember(conversation_id=conv.id, user_id=current_user_id, role="member"),
        ConversationMember(conversation_id=conv.id, user_id=other_user_id, role="member"),
    ])
    await db.commit()
    await db.refresh(conv)
    return ConversationRead.model_validate(conv)


async def create_group(
    db: AsyncSession, current_user_id: int, body: GroupConversationCreate
) -> ConversationDetail:
    """
    Create a named group conversation. Creator is auto-added as admin.
    """
    if not body.name.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Group name required.")

    # Validate all provided member IDs exist
    unique_ids = set(body.member_ids) | {current_user_id}
    for uid in unique_ids:
        if uid != current_user_id:
            user = await db.get(User, uid)
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User {uid} not found.",
                )

    conv = Conversation(
        type="group",
        name=body.name.strip(),
        avatar_url=body.avatar_url,
        created_by=current_user_id,
    )
    db.add(conv)
    await db.flush()

    members = [
        ConversationMember(
            conversation_id=conv.id,
            user_id=uid,
            role="admin" if uid == current_user_id else "member",
        )
        for uid in unique_ids
    ]
    db.add_all(members)
    await db.commit()

    # Reload with members
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.members))
        .where(Conversation.id == conv.id)
    )
    conv = result.scalar_one()
    return ConversationDetail.model_validate(conv)


async def get_conversation_detail(
    db: AsyncSession, current_user_id: int, conversation_id: int
) -> ConversationDetail:
    await _require_member(db, conversation_id, current_user_id)
    conv = await _get_conversation_or_404(db, conversation_id)
    return ConversationDetail.model_validate(conv)


async def update_conversation(
    db: AsyncSession,
    current_user_id: int,
    conversation_id: int,
    body: ConversationUpdate,
) -> ConversationRead:
    """Rename / change avatar of a group (admin only)."""
    conv = await _get_conversation_or_404(db, conversation_id)
    if conv.type != "group":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only group conversations can be updated.",
        )
    await _require_admin(db, conversation_id, current_user_id)

    if body.name is not None:
        conv.name = body.name.strip()
    if body.avatar_url is not None:
        conv.avatar_url = body.avatar_url

    await db.commit()
    await db.refresh(conv)
    return ConversationRead.model_validate(conv)


async def add_member(
    db: AsyncSession,
    current_user_id: int,
    conversation_id: int,
    new_user_id: int,
) -> None:
    """Add a user to a group conversation (admin only)."""
    conv = await _get_conversation_or_404(db, conversation_id)
    if conv.type != "group":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Only groups support member management."
        )
    await _require_admin(db, conversation_id, current_user_id)

    # Check target user exists
    user = await db.get(User, new_user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # Check not already a member
    existing = await db.execute(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == new_user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User is already a member."
        )

    db.add(ConversationMember(conversation_id=conversation_id, user_id=new_user_id, role="member"))
    await db.commit()


async def remove_member(
    db: AsyncSession,
    current_user_id: int,
    conversation_id: int,
    target_user_id: int,
) -> None:
    """Remove a user from a group conversation (admin only, can't remove self if last admin)."""
    conv = await _get_conversation_or_404(db, conversation_id)
    if conv.type != "group":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Only groups support member management."
        )
    await _require_admin(db, conversation_id, current_user_id)

    result = await db.execute(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == target_user_id,
        )
    )
    member = result.scalar_one_or_none()
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    await db.delete(member)
    await db.commit()
