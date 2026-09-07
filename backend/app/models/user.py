"""User model — maps to the `users` table."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    phone_number: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    username: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(Text, nullable=True)
    status_message: Mapped[str] = mapped_column(Text, nullable=False, default="")
    is_online: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )

    # Relationships
    contacts_owned: Mapped[list["Contact"]] = relationship(  # noqa: F821
        "Contact",
        foreign_keys="Contact.owner_id",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    contacts_received: Mapped[list["Contact"]] = relationship(  # noqa: F821
        "Contact",
        foreign_keys="Contact.contact_user_id",
        back_populates="contact_user",
        cascade="all, delete-orphan",
    )
    conversations_created: Mapped[list["Conversation"]] = relationship(  # noqa: F821
        "Conversation",
        back_populates="creator",
    )
    memberships: Mapped[list["ConversationMember"]] = relationship(  # noqa: F821
        "ConversationMember",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    messages_sent: Mapped[list["Message"]] = relationship(  # noqa: F821
        "Message",
        back_populates="sender",
    )
    message_statuses: Mapped[list["MessageStatus"]] = relationship(  # noqa: F821
        "MessageStatus",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reactions: Mapped[list["Reaction"]] = relationship(  # noqa: F821
        "Reaction",
        back_populates="user",
        cascade="all, delete-orphan",
    )
