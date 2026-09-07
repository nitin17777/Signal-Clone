"""
WebSocket router — WS /ws?token=<jwt>

Contract: docs/ws-contract.md

Client → Server events handled:
  message:send     — persist + broadcast message:new to all members
  typing:start     — broadcast typing:update (is_typing=true) to other members
  typing:stop      — broadcast typing:update (is_typing=false) to other members
  message:read     — update MessageStatus to read + broadcast message:status to sender
  presence:ping    — reply with presence:update for this user

Server → Client events emitted:
  message:new      — full MessageRead payload, sent to ALL members (incl. sender)
  message:status   — {message_id, user_id, status} for read receipts
  typing:update    — {conversation_id, user_id, is_typing}
  presence:update  — {user_id, is_online, last_seen_at}
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.schemas.message import MessageCreate
from app.services import message_service
from app.ws.manager import manager

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _authenticate(token: str | None) -> User | None:
    """Decode JWT from query param and return the User, or None if invalid."""
    if not token:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    user_id_str = payload.get("sub")
    if user_id_str is None:
        return None

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.id == int(user_id_str)))
        return result.scalar_one_or_none()


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str | None = None,
) -> None:
    """Single persistent WS connection per logged-in user."""

    # 1. Authenticate
    user = await _authenticate(token)
    if user is None:
        await websocket.close(code=4001)   # 4001 = Unauthorized (custom)
        return

    # 2. Register
    await manager.connect(user.id, websocket)

    # 3. Announce this user as online to themselves (optional UX touch)
    await manager.send_to(user.id, {
        "type": "presence:update",
        "user_id": user.id,
        "is_online": True,
        "last_seen_at": None,
    })

    # 4. Event loop
    try:
        while True:
            data = await websocket.receive_json()
            event_type: str = data.get("type", "")

            # ----------------------------------------------------------------
            # message:send
            # ----------------------------------------------------------------
            if event_type == "message:send":
                conversation_id: int | None = data.get("conversation_id")
                content: str | None = data.get("content")
                reply_to: int | None = data.get("reply_to")

                if conversation_id is None:
                    await manager.send_to(user.id, {
                        "type": "error",
                        "detail": "conversation_id is required for message:send",
                    })
                    continue

                async with AsyncSessionLocal() as db:
                    try:
                        msg_read = await message_service.send_message(
                            db=db,
                            current_user_id=user.id,
                            conversation_id=conversation_id,
                            body=MessageCreate(
                                content=content,
                                reply_to_message_id=reply_to,
                            ),
                        )
                    except Exception as exc:
                        await manager.send_to(user.id, {
                            "type": "error",
                            "detail": str(exc),
                        })
                        continue

                    # Broadcast message:new to ALL members (incl. sender)
                    payload = {
                        "type": "message:new",
                        "message": msg_read.model_dump(mode="json"),
                    }
                    await manager.broadcast_to_conversation(
                        db=db,
                        conversation_id=conversation_id,
                        payload=payload,
                        exclude_user_id=None,   # include sender
                    )

            # ----------------------------------------------------------------
            # typing:start / typing:stop
            # ----------------------------------------------------------------
            elif event_type in ("typing:start", "typing:stop"):
                conversation_id = data.get("conversation_id")
                if conversation_id is None:
                    continue

                is_typing = event_type == "typing:start"
                payload = {
                    "type": "typing:update",
                    "conversation_id": conversation_id,
                    "user_id": user.id,
                    "is_typing": is_typing,
                }
                async with AsyncSessionLocal() as db:
                    # Broadcast to others only — sender doesn't need their own indicator
                    await manager.broadcast_to_conversation(
                        db=db,
                        conversation_id=conversation_id,
                        payload=payload,
                        exclude_user_id=user.id,
                    )

            # ----------------------------------------------------------------
            # message:read
            # ----------------------------------------------------------------
            elif event_type == "message:read":
                conversation_id = data.get("conversation_id")
                message_id: int | None = data.get("message_id")

                if message_id is None:
                    continue

                async with AsyncSessionLocal() as db:
                    try:
                        await message_service.mark_read(
                            db=db,
                            current_user_id=user.id,
                            message_id=message_id,
                        )
                    except Exception as exc:
                        logger.warning("mark_read error: %s", exc)
                        continue

                    # Notify the WHOLE conversation about the new status
                    if conversation_id is not None:
                        status_payload = {
                            "type": "message:status",
                            "message_id": message_id,
                            "user_id": user.id,
                            "status": "read",
                        }
                        await manager.broadcast_to_conversation(
                            db=db,
                            conversation_id=conversation_id,
                            payload=status_payload,
                            exclude_user_id=None,
                        )

            # ----------------------------------------------------------------
            # presence:ping
            # ----------------------------------------------------------------
            elif event_type == "presence:ping":
                await manager.send_to(user.id, {
                    "type": "presence:update",
                    "user_id": user.id,
                    "is_online": True,
                    "last_seen_at": None,
                })

            else:
                logger.debug("Unknown WS event type '%s' from user %s", event_type, user.id)

    except WebSocketDisconnect:
        logger.info("WS graceful disconnect: user_id=%s", user.id)
    except Exception as exc:
        logger.error("WS error for user %s: %s", user.id, exc, exc_info=True)
    finally:
        manager.disconnect(user.id)
