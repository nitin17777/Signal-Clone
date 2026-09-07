"""
ConnectionManager — in-memory registry of active WebSocket connections.

Maps user_id -> WebSocket. Provides helpers to:
  - connect   : register a user's socket
  - disconnect: remove it on close/error
  - send_to   : send a JSON payload to a specific user (no-op if offline)
  - broadcast_to_conversation : fan-out to every member of a conversation
"""
from __future__ import annotations

import logging
from typing import Any

from fastapi import WebSocket
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation_member import ConversationMember

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        # user_id -> active WebSocket
        self.active_connections: dict[int, WebSocket] = {}

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        """Accept and register a WebSocket for the given user."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info("WS connected: user_id=%s  total=%s", user_id, len(self.active_connections))

    def disconnect(self, user_id: int) -> None:
        """Remove a user's socket from the registry."""
        self.active_connections.pop(user_id, None)
        logger.info("WS disconnected: user_id=%s  total=%s", user_id, len(self.active_connections))

    # ------------------------------------------------------------------
    # Sending
    # ------------------------------------------------------------------

    async def send_to(self, user_id: int, payload: dict[str, Any]) -> None:
        """Send a JSON payload to a specific user, silently skip if offline."""
        ws = self.active_connections.get(user_id)
        if ws is not None:
            try:
                await ws.send_json(payload)
            except Exception as exc:
                logger.warning("Failed to send to user %s: %s", user_id, exc)
                self.disconnect(user_id)

    async def broadcast_to_conversation(
        self,
        db: AsyncSession,
        conversation_id: int,
        payload: dict[str, Any],
        exclude_user_id: int | None = None,
    ) -> None:
        """
        Fan-out *payload* to every online member of *conversation_id*.
        Pass exclude_user_id to skip the sender (useful for typing indicators
        — for message:new you usually DO want the sender to receive confirmation).
        """
        result = await db.execute(
            select(ConversationMember.user_id).where(
                ConversationMember.conversation_id == conversation_id
            )
        )
        member_ids: list[int] = result.scalars().all()

        for uid in member_ids:
            if exclude_user_id is not None and uid == exclude_user_id:
                continue
            await self.send_to(uid, payload)


# Singleton shared across the whole process
manager = ConnectionManager()
