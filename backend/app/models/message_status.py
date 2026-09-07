"""MessageStatus model — maps to the `message_status` table.

Tracks per-recipient delivery/read status for each message.
Statuses: 'sent' → 'delivered' → 'read' (as per ws-contract.md).
"""

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class MessageStatus(Base):
    __tablename__ = "message_status"
    __table_args__ = (
        UniqueConstraint("message_id", "user_id", name="uq_message_status_message_user"),
        CheckConstraint(
            "status IN ('sent', 'delivered', 'read')",
            name="ck_message_status_status",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    message_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String, nullable=False, default="sent")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )

    # Relationships
    message: Mapped["Message"] = relationship(  # noqa: F821
        "Message", back_populates="statuses"
    )
    user: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="message_statuses"
    )
