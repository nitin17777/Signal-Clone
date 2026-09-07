"""Pydantic v2 schemas for the ConversationMember model."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.user import UserPublic


# ---------------------------------------------------------------------------
# Read — single membership row
# ---------------------------------------------------------------------------
class ConversationMemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    user_id: int
    role: Literal["admin", "member"]
    joined_at: datetime
    last_read_message_id: int | None
    is_muted: bool
    user: UserPublic | None = None


# ---------------------------------------------------------------------------
# Update — mute toggle or role change (admin only)
# ---------------------------------------------------------------------------
class ConversationMemberUpdate(BaseModel):
    is_muted: bool | None = None
    role: Literal["admin", "member"] | None = None
