"""SQLAlchemy ORM models — import all to ensure Alembic picks them up."""

from app.models.user import User
from app.models.contact import Contact
from app.models.conversation import Conversation
from app.models.conversation_member import ConversationMember
from app.models.message import Message
from app.models.message_status import MessageStatus
from app.models.attachment import Attachment
from app.models.reaction import Reaction

__all__ = [
    "User",
    "Contact",
    "Conversation",
    "ConversationMember",
    "Message",
    "MessageStatus",
    "Attachment",
    "Reaction",
]
