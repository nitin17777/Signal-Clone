"""Pydantic v2 schemas for the Conversation model."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.conversation_member import ConversationMemberRead


# ---------------------------------------------------------------------------
# Create variants
# ---------------------------------------------------------------------------
class DirectConversationCreate(BaseModel):
    """POST /conversations/direct — get-or-create a 1:1 conversation."""
    other_user_id: int


class GroupConversationCreate(BaseModel):
    """POST /conversations/group — create a named group."""
    name: str
    avatar_url: str | None = None
    member_ids: list[int]


# Unified alias used by route layer
ConversationCreate = DirectConversationCreate | GroupConversationCreate


# ---------------------------------------------------------------------------
# Update — PATCH /conversations/{id} (group rename / avatar; admin only)
# ---------------------------------------------------------------------------
class ConversationUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------
class ConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: Literal["direct", "group"]
    name: str | None
    avatar_url: str | None
    created_by: int | None
    created_at: datetime
    last_message_at: datetime | None


class ConversationDetail(ConversationRead):
    """Extended view — includes member list (returned by GET /conversations/{id})."""
    members: list[ConversationMemberRead] = []


# ---------------------------------------------------------------------------
# List item — optimised for conversation list view with unread + last-message
# ---------------------------------------------------------------------------
class ConversationListItem(ConversationRead):
    unread_count: int = 0
    last_message_preview: str | None = None
