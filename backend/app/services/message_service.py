"""
Message service — business logic for message-level operations.

Covers:
  - list_messages   GET  /conversations/{id}/messages (cursor-paginated)
  - send_message    POST /conversations/{id}/messages
  - mark_read       PATCH /messages/{id}/read
  - delete_message  DELETE /messages/{id}   (soft-delete)
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation
from app.models.conversation_member import ConversationMember
from app.models.message import Message
from app.models.message_status import MessageStatus
from app.schemas.message import MessageCreate, MessageRead


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

async def _require_member(
    db: AsyncSession, conversation_id: int, user_id: int
) -> ConversationMember:
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


async def _require_conversation(db: AsyncSession, conversation_id: int) -> Conversation:
    conv = await db.get(Conversation, conversation_id)
    if conv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found."
        )
    return conv


# ---------------------------------------------------------------------------
# Service functions
# ---------------------------------------------------------------------------

async def list_messages(
    db: AsyncSession,
    current_user_id: int,
    conversation_id: int,
    before: int | None = None,
    limit: int = 50,
) -> list[MessageRead]:
    """
    Return up to `limit` messages in a conversation, cursor-paginated by ID.
    `before` is a message ID — only messages with id < before are returned.
    Results are ordered newest-first (DESC) to facilitate infinite-scroll,
    then reversed before returning so client gets chronological order.
    """
    await _require_conversation(db, conversation_id)
    await _require_member(db, conversation_id, current_user_id)

    limit = min(limit, 100)  # hard cap

    q = (
        select(Message)
        .options(
            selectinload(Message.attachments),
            selectinload(Message.reactions),
        )
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.id.desc())
        .limit(limit)
    )
    if before is not None:
        q = q.where(Message.id < before)

    result = await db.execute(q)
    messages = list(reversed(result.scalars().all()))
    return [MessageRead.model_validate(m) for m in messages]


async def send_message(
    db: AsyncSession,
    current_user_id: int,
    conversation_id: int,
    body: MessageCreate,
) -> MessageRead:
    """
    Insert a new message and create per-recipient MessageStatus rows.
    Also updates conversation.last_message_at.
    """
    conv = await _require_conversation(db, conversation_id)
    await _require_member(db, conversation_id, current_user_id)

    if not body.content and body.reply_to_message_id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message must have content.",
        )

    # Validate reply target exists and belongs to this conversation
    if body.reply_to_message_id is not None:
        reply_to = await db.get(Message, body.reply_to_message_id)
        if reply_to is None or reply_to.conversation_id != conversation_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Reply target not found."
            )

    msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user_id,
        content=body.content,
        reply_to_message_id=body.reply_to_message_id,
    )
    db.add(msg)
    await db.flush()  # get msg.id

    # Create sent status for each recipient (everyone except sender)
    member_rows = await db.execute(
        select(ConversationMember.user_id).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id != current_user_id,
        )
    )
    recipient_ids = member_rows.scalars().all()

    for uid in recipient_ids:
        db.add(
            MessageStatus(
                message_id=msg.id,
                user_id=uid,
                status="sent",
            )
        )

    # Advance sender's last_read_message_id
    sender_res = await db.execute(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == current_user_id,
        )
    )
    sender_member = sender_res.scalar_one_or_none()
    if sender_member:
        sender_member.last_read_message_id = msg.id

    # Update conversation.last_message_at
    conv.last_message_at = datetime.now(timezone.utc).replace(tzinfo=None)

    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(Message)
        .options(selectinload(Message.attachments), selectinload(Message.reactions))
        .where(Message.id == msg.id)
    )
    msg = result.scalar_one()
    return MessageRead.model_validate(msg)


async def mark_read(
    db: AsyncSession,
    current_user_id: int,
    message_id: int,
) -> None:
    """
    Mark a message as read for the current user.
    Also advances last_read_message_id on the membership row and updates
    MessageStatus rows for this user up to message_id.
    """
    msg = await db.get(Message, message_id)
    if msg is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found.")

    # User must be a member of that conversation
    member = await _require_member(db, msg.conversation_id, current_user_id)

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Batch update status for all messages up to message_id in this conversation
    conv_msg_ids = select(Message.id).where(
        Message.conversation_id == msg.conversation_id,
        Message.id <= message_id,
    )
    await db.execute(
        update(MessageStatus)
        .where(
            MessageStatus.user_id == current_user_id,
            MessageStatus.message_id.in_(conv_msg_ids),
            MessageStatus.status != "read",
        )
        .values(status="read", updated_at=now)
    )

    # Ensure this message itself has a status row if not already present
    result = await db.execute(
        select(MessageStatus).where(
            MessageStatus.message_id == message_id,
            MessageStatus.user_id == current_user_id,
        )
    )
    ms = result.scalar_one_or_none()
    if ms is None and msg.sender_id != current_user_id:
        db.add(
            MessageStatus(
                message_id=message_id,
                user_id=current_user_id,
                status="read",
                updated_at=now,
            )
        )

    # Advance last_read_message_id on the member row
    if member.last_read_message_id is None or member.last_read_message_id < message_id:
        member.last_read_message_id = message_id

    await db.commit()


async def delete_message(
    db: AsyncSession,
    current_user_id: int,
    message_id: int,
) -> None:
    """Soft-delete a message (only the sender may delete)."""
    msg = await db.get(Message, message_id)
    if msg is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found.")

    # Must be a member of the conversation
    await _require_member(db, msg.conversation_id, current_user_id)

    if msg.sender_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own messages.",
        )
    if msg.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Message already deleted."
        )

    msg.is_deleted = True
    msg.content = None  # scrub content for privacy
    await db.commit()
