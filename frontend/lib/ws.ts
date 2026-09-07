/**
 * SignalWS — WebSocket client singleton for Signal Clone.
 *
 * Features:
 *  - Connects to WS /ws (no token needed — browser sends httpOnly cookie automatically)
 *  - Typed event emitter (subscribe / unsubscribe)
 *  - Auto-reconnect with exponential backoff (max 30 s)
 *  - Graceful disconnect (no reconnect on intentional close)
 */

export function getWsUrl(): string {
  let raw = process.env.NEXT_PUBLIC_WS_URL;
  if (!raw) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      raw = 'wss://signal-clone-x1x8.onrender.com';
    } else if (process.env.NODE_ENV === 'production') {
      raw = 'wss://signal-clone-x1x8.onrender.com';
    } else {
      raw = 'ws://localhost:8000';
    }
  } else if (typeof window !== 'undefined' && window.location.protocol === 'https:' && raw.startsWith('ws://localhost')) {
    raw = 'wss://signal-clone-x1x8.onrender.com';
  }
  const clean = raw.trim().replace(/\/+$/, '').replace(/\/ws\/?$/, '');
  return `${clean}/ws`;
}

const WS_URL = getWsUrl();


// ---------------------------------------------------------------------------
// Types mirroring ws-contract.md
// ---------------------------------------------------------------------------
export type WsEventType =
  | 'message:new'
  | 'message:status'
  | 'typing:update'
  | 'presence:update'
  | 'conversation:update'
  | 'error';

export interface WsMessageNew {
  type: 'message:new';
  message: {
    id: number;
    conversation_id: number;
    sender_id: number;
    content: string | null;
    reply_to_message_id: number | null;
    is_deleted: boolean;
    created_at: string;
    attachments: any[];
    reactions: any[];
  };
}

export interface WsMessageStatus {
  type: 'message:status';
  message_id: number;
  user_id: number;
  status: 'sent' | 'delivered' | 'read';
}

export interface WsTypingUpdate {
  type: 'typing:update';
  conversation_id: number;
  user_id: number;
  is_typing: boolean;
}

export interface WsPresenceUpdate {
  type: 'presence:update';
  user_id: number;
  is_online: boolean;
  last_seen_at: string | null;
}

export interface WsError {
  type: 'error';
  detail: string;
}

export type WsInboundEvent =
  | WsMessageNew
  | WsMessageStatus
  | WsTypingUpdate
  | WsPresenceUpdate
  | WsError;

// ---------------------------------------------------------------------------
// Client → Server payloads
// ---------------------------------------------------------------------------
export interface SendMessagePayload {
  type: 'message:send';
  conversation_id: number;
  content: string;
  reply_to: number | null;
}

export interface TypingPayload {
  type: 'typing:start' | 'typing:stop';
  conversation_id: number;
}

export interface ReadPayload {
  type: 'message:read';
  conversation_id: number;
  message_id: number;
}

export interface PingPayload {
  type: 'presence:ping';
}

export type WsOutboundEvent = SendMessagePayload | TypingPayload | ReadPayload | PingPayload;

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------
type Handler = (event: WsInboundEvent) => void;

class SignalWS {
  private ws: WebSocket | null = null;
  private listeners: Map<WsEventType, Set<Handler>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffMs = 1000;
  private intentionalClose = false;
  private _connected = false;

  get isConnected() {
    return this._connected;
  }

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.intentionalClose = false;
    this._open();
  }

  disconnect() {
    this.intentionalClose = true;
    this._connected = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Client logout');
      this.ws = null;
    }
  }

  private _open() {
    try {
      // Browser automatically sends the httpOnly access_token cookie here
      this.ws = new WebSocket(WS_URL);
    } catch (err) {
      console.error('[WS] Failed to construct WebSocket:', err);
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this._connected = true;
      this.backoffMs = 1000; // reset backoff
    };

    this.ws.onmessage = (ev: MessageEvent) => {
      try {
        const data: WsInboundEvent = JSON.parse(ev.data as string);
        const handlers = this.listeners.get(data.type as WsEventType);
        if (handlers) {
          handlers.forEach((h) => h(data));
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    this.ws.onclose = (ev: CloseEvent) => {
      console.log('[WS] Closed:', ev.code, ev.reason);
      this._connected = false;
      this.ws = null;
      if (!this.intentionalClose) {
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Error:', err);
      // onclose will fire after onerror — reconnect handled there
    };
  }

  private _scheduleReconnect() {
    if (this.intentionalClose) return;
    const delay = Math.min(this.backoffMs, 30000);
    console.log(`[WS] Reconnecting in ${delay}ms…`);
    this.reconnectTimer = setTimeout(() => {
      this.backoffMs = Math.min(this.backoffMs * 2, 30000);
      this._open();
    }, delay);
  }

  // ------------------------------------------------------------------
  // Sending
  // ------------------------------------------------------------------

  send(payload: WsOutboundEvent) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else {
      console.warn('[WS] Cannot send — not connected:', payload.type);
    }
  }

  // ------------------------------------------------------------------
  // Subscriptions
  // ------------------------------------------------------------------

  subscribe<T extends WsInboundEvent>(eventType: WsEventType, handler: (event: T) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler as Handler);
    // Return an unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(handler as Handler);
    };
  }
}

// Export a singleton — shared across the entire app lifecycle
export const signalWS = new SignalWS();
