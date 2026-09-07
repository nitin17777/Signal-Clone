"""
Messages router — spec: docs/api-contract.md

Endpoints:
  GET  /conversations/{id}/messages        — cursor-paginated history
  POST /conversations/{id}/messages        — send message
  PATCH /messages/{id}/read                — mark message as read
  DELETE /messages/{id}                    — soft-delete (sender only)

All routes require a valid JWT cookie (get_current_user dependency).
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.message import MessageCreate, MessageRead
from app.services import message_service
from app.ws.manager import manager

router = APIRouter(tags=["messages"])


# ---------------------------------------------------------------------------
# GET /conversations/{id}/messages   (cursor-paginated)
# ---------------------------------------------------------------------------
@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageRead],
    summary="Cursor-paginated message history. Pass `before` (message id) for older pages.",
)
async def list_messages(
    conversation_id: int,
    before: int | None = Query(default=None, description="Return messages with id < before"),
    limit: int = Query(default=50, ge=1, le=100, description="Max messages per page (1-100)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MessageRead]:
    return await message_service.list_messages(
        db, current_user.id, conversation_id, before=before, limit=limit
    )


# ---------------------------------------------------------------------------
# POST /conversations/{id}/messages
# ---------------------------------------------------------------------------
@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=MessageRead,
    status_code=status.HTTP_201_CREATED,
    summary="Send a message to a conversation.",
)
async def send_message(
    conversation_id: int,
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageRead:
    msg = await message_service.send_message(db, current_user.id, conversation_id, body)
    payload = {
        "type": "message:new",
        "message": msg.model_dump(mode="json"),
        "conversation_id": conversation_id,
    }
    await manager.broadcast_to_conversation(
        db=db,
        conversation_id=conversation_id,
        payload=payload,
        exclude_user_id=None,
    )
    return msg


# ---------------------------------------------------------------------------
# PATCH /messages/{id}/read
# ---------------------------------------------------------------------------
@router.patch(
    "/messages/{message_id}/read",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Mark a message as read. Advances the member's last_read_message_id.",
)
async def mark_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await message_service.mark_read(db, current_user.id, message_id)


# ---------------------------------------------------------------------------
# DELETE /messages/{id}
# ---------------------------------------------------------------------------
@router.delete(
    "/messages/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Soft-delete a message (sender only). Content is scrubbed.",
)
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await message_service.delete_message(db, current_user.id, message_id)
