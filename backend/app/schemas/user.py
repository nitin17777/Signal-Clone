"""Pydantic v2 schemas for the User model."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Shared base (fields common to Create and Read)
# ---------------------------------------------------------------------------
class UserBase(BaseModel):
    phone_number: str | None = None
    username: str | None = None
    display_name: str
    avatar_url: str | None = None
    status_message: str = ""


# ---------------------------------------------------------------------------
# Create — used on registration; password_hash is set server-side
# ---------------------------------------------------------------------------
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Plain-text password; hashed server-side")


# ---------------------------------------------------------------------------
# Update — all optional PATCH fields
# ---------------------------------------------------------------------------
class UserUpdate(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None
    status_message: str | None = None
    username: str | None = None


# ---------------------------------------------------------------------------
# Read — full row returned to authenticated user (includes private fields)
# ---------------------------------------------------------------------------
class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_online: bool
    last_seen_at: datetime | None
    created_at: datetime


# ---------------------------------------------------------------------------
# Public — safe subset returned when viewing other users' profiles
# ---------------------------------------------------------------------------
class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_name: str
    username: str | None
    avatar_url: str | None
    status_message: str
    is_online: bool
    last_seen_at: datetime | None
