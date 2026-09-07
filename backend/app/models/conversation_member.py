"""ConversationMember model — maps to the `conversation_members` table.

Junction table for both direct and group conversations.
`last_read_message_id` drives the unread-count calculation.
"""

from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class ConversationMember(Base):
    __tablename__ = "conversation_members"
    __table_args__ = (
        UniqueConstraint("conversation_id", "user_id"),
        CheckConstraint("role IN ('admin', 'member')", name="ck_members_role"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String, nullable=False, default="member")
    joined_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )
    last_read_message_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_muted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    conversation: Mapped["Conversation"] = relationship(  # noqa: F821
        "Conversation", back_populates="members"
    )
    user: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="memberships"
    )
