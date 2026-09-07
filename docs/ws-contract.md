# WebSocket Contract

Single endpoint: `WS /ws?token=<jwt>` — one persistent connection per logged-in user.
Backend maintains an in-memory `ConnectionManager: dict[user_id, WebSocket]`.

## Client → Server

```json
{ "type": "message:send", "conversation_id": 12, "content": "hey", "reply_to": null }
{ "type": "typing:start", "conversation_id": 12 }
{ "type": "typing:stop",  "conversation_id": 12 }
{ "type": "message:read", "conversation_id": 12, "message_id": 88 }
{ "type": "presence:ping" }
```

## Server → Client

```json
{ "type": "message:new",       "message": { "...full message object..." } }
{ "type": "message:status",    "message_id": 88, "user_id": 3, "status": "delivered" }
{ "type": "typing:update",     "conversation_id": 12, "user_id": 3, "is_typing": true }
{ "type": "presence:update",   "user_id": 3, "is_online": true, "last_seen_at": null }
{ "type": "conversation:update", "conversation_id": 12, "last_message": {} }
```

## Flow

1. Sender sends `message:send` (or POST) → server persists, creates `message_status`
   rows (`sent`) for all other members, updates `conversations.last_message_at`,
   broadcasts `message:new` to all members.
2. Recipients auto-ack receipt → `message:status` (`delivered`).
3. Recipient opens the conversation → client sends `message:read` → server updates
   status → `read` → broadcasts `message:status` back to sender.
4. Typing indicators are ephemeral, never persisted, auto-expire client-side after
   ~3s of inactivity.