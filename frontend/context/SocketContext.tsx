'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { signalWS, WsEventType, WsInboundEvent, WsOutboundEvent } from '@/lib/ws';

interface SocketContextType {
  /** Send any client->server event */
  send: (payload: WsOutboundEvent) => void;
  /** Subscribe to a server->client event type. Returns an unsubscribe fn. */
  subscribe: <T extends WsInboundEvent>(
    eventType: WsEventType,
    handler: (event: T) => void
  ) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // User is authenticated — open (or re-use) the WS connection.
      // The browser httpOnly cookie is sent automatically on the upgrade request.
      signalWS.connect();
    } else {
      // User logged out — close cleanly.
      signalWS.disconnect();
    }

    return () => {
      // Do NOT disconnect on component re-render; only on user -> null transition above.
    };
  }, [user]);

  const ctx: SocketContextType = {
    send: (payload) => signalWS.send(payload),
    subscribe: (eventType, handler) => signalWS.subscribe(eventType, handler),
  };

  return <SocketContext.Provider value={ctx}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextType => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};
