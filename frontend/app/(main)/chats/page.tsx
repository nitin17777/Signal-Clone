'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { ConversationListItem } from '@/components/contacts/ConversationListItem';
import { NewGroupModal } from '@/components/contacts/NewGroupModal';
import { api, ConversationListItem as ApiConversation } from '@/lib/api';
import { MockConversation } from '@/lib/mock-data';
import type { WsMessageNew } from '@/lib/ws';

export default function ChatsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const { subscribe } = useSocket();
  const [incomingToast, setIncomingToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch conversations from the real backend API
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getConversations();
      setConversations(data);
      // Automatically select the first conversation if none selected
      setSelectedId((prev) => (prev !== null ? prev : data[0]?.id ?? null));
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      setError(err?.message || 'Failed to load conversations. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // WebSocket subscription for new messages in other conversations
  useEffect(() => {
    const unsubNew = subscribe<WsMessageNew>('message:new', (ev) => {
      if (ev.message.conversation_id !== selectedId) {
        setConversations((prev) => {
          const src = prev.find((c) => c.id === ev.message.conversation_id);
          const name = src?.name || 'Another conversation';
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          setIncomingToast(`New message in ${name}`);
          toastTimerRef.current = setTimeout(() => setIncomingToast(null), 4000);
          return prev.map((c) =>
            c.id === ev.message.conversation_id
              ? {
                  ...c,
                  last_message_preview: ev.message.content ?? '',
                  last_message_at: ev.message.created_at,
                  unread_count: (c.unread_count || 0) + 1,
                }
              : c
          );
        });
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? {
                  ...c,
                  last_message_preview: ev.message.content ?? '',
                  last_message_at: ev.message.created_at,
                }
              : c
          )
        );
      }
    });

    return () => {
      unsubNew();
    };
  }, [subscribe, selectedId]);

  // Sort conversations by most recent (last_message_at descending)
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [conversations]);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return sortedConversations;
    const query = searchQuery.toLowerCase();
    return sortedConversations.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.last_message_preview && c.last_message_preview.toLowerCase().includes(query))
    );
  }, [sortedConversations, searchQuery]);

  // Final displayed conversations (applying unread filter if active)
  const displayedConversations = useMemo(() => {
    if (unreadOnly) {
      return filteredConversations.filter((c) => (c.unread_count || 0) > 0);
    }
    return filteredConversations;
  }, [filteredConversations, unreadOnly]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0),
    [conversations]
  );

  return (
    <div className="flex h-screen w-full bg-bg-dark text-text-primary overflow-hidden">
      {/* ---------------- Left Sidebar: Conversation List ---------------- */}
      <aside
        className={`w-full md:w-80 lg:w-[350px] flex flex-col border-r border-[#2C2D30]/80 bg-[#1B1C1D] shrink-0 h-full ${
          selectedId !== null ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Top Header: Chats title & actions matching exact Signal screenshot */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Chats</h1>
          <div className="flex items-center gap-1">
            {/* Compose / New Chat button */}
            <button
              id="new-chat-modal-btn"
              onClick={() => setIsNewChatModalOpen(true)}
              title="New chat"
              className="p-2 text-[#A0A2A8] hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[18px] h-[18px]"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            {/* New Group button */}
            <button
              id="new-group-modal-btn"
              onClick={() => setIsNewGroupModalOpen(true)}
              title="New Group"
              className="p-2 text-[#A0A2A8] hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[18px] h-[18px]"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>

            {/* More Menu */}
            <button
              title="More options"
              className="p-2 text-[#A0A2A8] hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar + Filter Button matching photo */}
        <div className="px-4 pb-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={unreadOnly ? 'Search unread chats' : 'Search'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2C2D30] text-white text-[14px] rounded-full pl-9 pr-3 py-1.5 placeholder-[#8E9096] focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9096] pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          {/* Filter button (toggles unread only) */}
          <button
            onClick={() => setUnreadOnly((prev) => !prev)}
            title={unreadOnly ? 'Clear unread filter' : 'Filter by unread'}
            className={`p-1.5 rounded-full transition-all ${
              unreadOnly
                ? 'bg-signal-blue text-white shadow-md'
                : 'text-[#8E9096] hover:text-white hover:bg-white/5'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filtered by unread indicator */}
        {unreadOnly && (
          <div className="px-5 py-1 text-[13px] text-[#8E9096]">
            Filtered by unread
          </div>
        )}

        {/* Scrollable List with Loading, Error, and Empty states */}
        <div className="flex-1 overflow-y-auto px-1 py-1 space-y-0.5">
          {/* Loading State: Skeletons */}
          {loading && conversations.length === 0 && (
            <div className="space-y-2 p-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-[12px] bg-bg-panel/40">
                  <div className="w-10 h-10 rounded-full bg-neutral-700/50 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-neutral-700/60 rounded w-28" />
                    <div className="h-2.5 bg-neutral-700/40 rounded w-44" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="m-3 p-3.5 rounded-panel bg-red-500/10 border border-red-500/30 text-center">
              <p className="text-xs text-red-400 mb-2 leading-relaxed">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchConversations}
                className="text-xs py-1 px-3"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Empty State when Filtered */}
          {!loading && !error && unreadOnly && displayedConversations.length === 0 && (
            <div className="py-16 text-center px-4 flex flex-col items-center justify-center gap-3">
              <p className="text-[15px] font-medium text-white">No unread chats</p>
              <button
                onClick={() => setUnreadOnly(false)}
                className="px-4 py-1.5 rounded-full bg-[#2C2D30] hover:bg-[#38393C] text-white text-[13px] font-medium transition-colors"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Empty State when search matches nothing */}
          {!loading && !error && !unreadOnly && displayedConversations.length === 0 && (
            <div className="py-16 text-center text-[#8E9096] text-xs px-4">
              {searchQuery ? 'No matching conversations found.' : 'No conversations yet. Start a new chat to begin messaging!'}
            </div>
          )}

          {/* Conversation List */}
          {!loading &&
            !error &&
            displayedConversations.map((conv) => {
              // Pass shape to ConversationListItem without modifying its internal logic
              const itemData: MockConversation = {
                id: conv.id,
                type: conv.type,
                name: conv.name || (conv.type === 'direct' ? 'Direct Message' : 'Group'),
                avatar_url: conv.avatar_url,
                created_by: conv.created_by,
                created_at: conv.created_at,
                last_message_at: conv.last_message_at,
                unread_count: conv.unread_count,
                last_message_preview: conv.last_message_preview,
                is_online: conv.is_online,
              };

              return (
                <ConversationListItem
                  key={conv.id}
                  conversation={itemData}
                  isSelected={conv.id === selectedId}
                  onClick={() => router.push(`/chats/${conv.id}`)}
                />
              );
            })}
        </div>
      </aside>

      {/* ---------------- Right Pane: Active Chat or Empty State ---------------- */}
      <main
        className={`flex-1 flex flex-col h-full bg-[#18191C] overflow-hidden ${
          selectedId === null ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Active Chat Header */}
            <header className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800/80 bg-bg-dark shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden p-1.5 -ml-1.5 text-text-secondary hover:text-text-primary rounded-lg"
                  aria-label="Back to conversations"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                <Avatar
                  name={selectedConversation.name || (selectedConversation.type === 'direct' ? 'Direct Message' : 'Group')}
                  src={selectedConversation.avatar_url}
                  size="md"
                  isOnline={selectedConversation.is_online}
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-text-primary truncate">
                    {selectedConversation.name || (selectedConversation.type === 'direct' ? 'Direct Message' : 'Group')}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {selectedConversation.type === 'group'
                      ? 'Group conversation'
                      : selectedConversation.is_online
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-text-secondary bg-bg-panel px-2.5 py-1 rounded-full border border-neutral-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 text-online-green"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  End-to-End Encrypted
                </span>
              </div>
            </header>

            {/* Chat Body Placeholder */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end space-y-3">
              {/* E2EE Info banner */}
              <div className="mx-auto max-w-sm text-center py-2 px-4 rounded-panel bg-bg-panel/40 border border-neutral-800/60 text-xs text-text-secondary leading-relaxed">
                🔒 Messages and calls are end-to-end encrypted. No one outside of this chat, not
                even Signal, can read or listen to them.
              </div>

              {/* Sample preview message bubble */}
              {selectedConversation.last_message_preview && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] rounded-bubble bg-bubble-received px-4 py-2.5 text-sm text-text-primary shadow-sm">
                    <p>{selectedConversation.last_message_preview}</p>
                    {selectedConversation.last_message_at && (
                      <span className="text-[10px] text-text-secondary block text-right mt-1">
                        {new Date(selectedConversation.last_message_at).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Message input placeholder for upcoming phase */}
            <footer className="p-3 border-t border-neutral-800/80 bg-bg-dark shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  disabled
                  placeholder={`Message ${selectedConversation.name || 'chat'}... (messaging active in next phase)`}
                  className="bg-bg-panel/60 text-sm cursor-not-allowed opacity-75"
                />
                <Button disabled size="md" className="opacity-60 cursor-not-allowed">
                  Send
                </Button>
              </div>
            </footer>
          </>
        ) : (
          /* Empty selection state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-bg-panel flex items-center justify-center text-accent-blue mb-4 border border-neutral-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Signal for Web</h2>
            <p className="text-xs text-text-secondary max-w-sm leading-relaxed mb-4">
              Select a conversation from the left to view messages, or start a new chat.
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsNewChatModalOpen(true)}>
              Start a Conversation
            </Button>
          </div>
        )}
      </main>

      {/* Cross-conversation incoming message Toast */}
      {incomingToast && (
        <Toast
          message={incomingToast}
          type="info"
          onClose={() => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            setIncomingToast(null);
          }}
        />
      )}

      {/* New Chat Modal */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Start New Chat"
      >
        <div className="space-y-4 pt-1">
          <Input placeholder="Enter username or phone number..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsNewChatModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewChatModalOpen(false)}
            >
              Start Chat
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Group Modal */}
      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        onGroupCreated={() => fetchConversations()}
      />
    </div>
  );
}
