"""Pydantic v2 schemas for the Contact model."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Create — POST /contacts body
# ---------------------------------------------------------------------------
class ContactCreate(BaseModel):
    contact_user_id: int
    nickname: str | None = None


# ---------------------------------------------------------------------------
# Read — full contact row
# ---------------------------------------------------------------------------
class ContactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    contact_user_id: int
    nickname: str | None
    created_at: datetime
