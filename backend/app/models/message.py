"""Message model — maps to the `messages` table.

`content` is nullable for attachment-only messages.
`reply_to_message_id` is a self-referential FK for threaded replies.
`is_deleted` implements soft-delete (DELETE /messages/{id}).
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False
    )
    sender_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    reply_to_message_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("messages.id"), nullable=True
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )

    # Relationships
    conversation: Mapped["Conversation"] = relationship(  # noqa: F821
        "Conversation", back_populates="messages"
    )
    sender: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="messages_sent"
    )
    reply_to: Mapped["Message | None"] = relationship(
        "Message",
        remote_side="Message.id",
        foreign_keys=[reply_to_message_id],
        back_populates="replies",
    )
    replies: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="reply_to",
        foreign_keys=[reply_to_message_id],
    )
    statuses: Mapped[list["MessageStatus"]] = relationship(  # noqa: F821
        "MessageStatus",
        back_populates="message",
        cascade="all, delete-orphan",
    )
    attachments: Mapped[list["Attachment"]] = relationship(  # noqa: F821
        "Attachment",
        back_populates="message",
        cascade="all, delete-orphan",
    )
    reactions: Mapped[list["Reaction"]] = relationship(  # noqa: F821
        "Reaction",
        back_populates="message",
        cascade="all, delete-orphan",
    )
