"""Conversation model — maps to the `conversations` table.

Handles both 'direct' (1:1) and 'group' conversations via the `type` discriminator.
"""

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (
        CheckConstraint("type IN ('direct', 'group')", name="ck_conversations_type"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str | None] = mapped_column(Text, nullable=True)         # group name; NULL for direct
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)   # group avatar; NULL for direct
    created_by: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    creator: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="conversations_created"
    )
    members: Mapped[list["ConversationMember"]] = relationship(  # noqa: F821
        "ConversationMember",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )
    messages: Mapped[list["Message"]] = relationship(  # noqa: F821
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )
