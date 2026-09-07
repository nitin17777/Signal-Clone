"""Pydantic v2 schemas for the Reaction model."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Create — POST /messages/{id}/reactions body
# ---------------------------------------------------------------------------
class ReactionCreate(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=8, description="Unicode emoji character(s)")


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------
class ReactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message_id: int
    user_id: int
    emoji: str
    created_at: datetime
