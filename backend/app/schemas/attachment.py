"""Pydantic v2 schemas for the Attachment model."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, HttpUrl


# ---------------------------------------------------------------------------
# Create — attached alongside a message POST
# ---------------------------------------------------------------------------
class AttachmentCreate(BaseModel):
    url: str
    filename: str | None = None
    mime_type: str | None = None
    size_bytes: int | None = None


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------
class AttachmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message_id: int
    url: str
    filename: str | None
    mime_type: str | None
    size_bytes: int | None
    created_at: datetime
