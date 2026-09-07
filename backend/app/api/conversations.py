"""
Conversations router — spec: docs/api-contract.md

Endpoints (all under prefix /api/v1/conversations):
  GET  /                                — list my conversations
  POST /direct                          — get-or-create 1:1 conversation
  POST /group                           — create group conversation
  GET  /{id}                            — conversation detail + members
  PATCH /{id}                           — rename / change group avatar (admin only)
  POST  /{id}/members                   — add member (admin only)
  DELETE /{id}/members/{user_id}        — remove member (admin only)

All routes require a valid JWT cookie (get_current_user dependency).
"""

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.conversation import (
    ConversationDetail,
    ConversationListItem,
    ConversationRead,
    ConversationUpdate,
    DirectConversationCreate,
    GroupConversationCreate,
)
from app.services import conversation_service

router = APIRouter(prefix="/conversations", tags=["conversations"])


# ---------------------------------------------------------------------------
# GET /conversations — list
# ---------------------------------------------------------------------------
@router.get(
    "",
    response_model=list[ConversationListItem],
    summary="List conversations for the current user, sorted by latest activity.",
)
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ConversationListItem]:
    return await conversation_service.list_conversations(db, current_user.id)


# ---------------------------------------------------------------------------
# POST /conversations — create direct or group
# ---------------------------------------------------------------------------
@router.post(
    "",
    response_model=ConversationRead | ConversationDetail,
    status_code=status.HTTP_201_CREATED,
    summary="Create a direct or group conversation.",
)
async def create_conversation(
    body: GroupConversationCreate | DirectConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if isinstance(body, GroupConversationCreate):
        return await conversation_service.create_group(db, current_user.id, body)
    return await conversation_service.get_or_create_direct(db, current_user.id, body.other_user_id)


# ---------------------------------------------------------------------------
# POST /conversations/direct
# ---------------------------------------------------------------------------
@router.post(
    "/direct",
    response_model=ConversationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Get-or-create a 1:1 direct conversation.",
)
async def get_or_create_direct(
    body: DirectConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationRead:
    return await conversation_service.get_or_create_direct(db, current_user.id, body.other_user_id)


# ---------------------------------------------------------------------------
# POST /conversations/group
# ---------------------------------------------------------------------------
@router.post(
    "/group",
    response_model=ConversationDetail,
    status_code=status.HTTP_201_CREATED,
    summary="Create a group conversation. Creator is automatically admin.",
)
async def create_group(
    body: GroupConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationDetail:
    return await conversation_service.create_group(db, current_user.id, body)


# ---------------------------------------------------------------------------
# GET /conversations/{id}
# ---------------------------------------------------------------------------
@router.get(
    "/{conversation_id}",
    response_model=ConversationDetail,
    summary="Get conversation detail including the full member list.",
)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationDetail:
    return await conversation_service.get_conversation_detail(db, current_user.id, conversation_id)


# ---------------------------------------------------------------------------
# PATCH /conversations/{id}
# ---------------------------------------------------------------------------
@router.patch(
    "/{conversation_id}",
    response_model=ConversationRead,
    summary="Rename or update group avatar (admin only).",
)
async def update_conversation(
    conversation_id: int,
    body: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationRead:
    return await conversation_service.update_conversation(
        db, current_user.id, conversation_id, body
    )


# ---------------------------------------------------------------------------
# POST /conversations/{id}/members
# ---------------------------------------------------------------------------
class AddMemberBody(BaseModel):
    user_id: int


@router.post(
    "/{conversation_id}/members",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Add a member to a group conversation (admin only).",
)
async def add_member(
    conversation_id: int,
    body: AddMemberBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await conversation_service.add_member(db, current_user.id, conversation_id, body.user_id)


# ---------------------------------------------------------------------------
# DELETE /conversations/{id}/members/{user_id}
# ---------------------------------------------------------------------------
@router.delete(
    "/{conversation_id}/members/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a member from a group conversation (admin only).",
)
async def remove_member(
    conversation_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await conversation_service.remove_member(db, current_user.id, conversation_id, user_id)
