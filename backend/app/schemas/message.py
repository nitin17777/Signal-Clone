"""Pydantic v2 schemas for the Message model."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.attachment import AttachmentRead
from app.schemas.reaction import ReactionRead


# ---------------------------------------------------------------------------
# Create — POST /conversations/{id}/messages body
# ---------------------------------------------------------------------------
class MessageCreate(BaseModel):
    content: str | None = None
    reply_to_message_id: int | None = None


# ---------------------------------------------------------------------------
# Update — soft-delete only; content edits not in contract
# ---------------------------------------------------------------------------
class MessageUpdate(BaseModel):
    is_deleted: bool = True


# ---------------------------------------------------------------------------
# Read — full message row, including nested attachments and reactions
# ---------------------------------------------------------------------------
class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender_id: int
    content: str | None
    reply_to_message_id: int | None
    is_deleted: bool
    created_at: datetime
    attachments: list[AttachmentRead] = []
    reactions: list[ReactionRead] = []
