"""Pydantic v2 schemas for the MessageStatus model."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Read — status row per recipient
# ---------------------------------------------------------------------------
class MessageStatusRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message_id: int
    user_id: int
    status: Literal["sent", "delivered", "read"]
    updated_at: datetime


# ---------------------------------------------------------------------------
# Update — PATCH /messages/{id}/read body
# ---------------------------------------------------------------------------
class MessageStatusUpdate(BaseModel):
    status: Literal["sent", "delivered", "read"]
