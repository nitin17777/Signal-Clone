'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { signalWS } from '@/lib/ws';
import type { WsMessageNew, WsTypingUpdate, WsMessageStatus } from '@/lib/ws';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { ConversationListItem } from '@/components/contacts/ConversationListItem';
import { NewGroupModal } from '@/components/contacts/NewGroupModal';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Composer } from '@/components/chat/Composer';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { GroupInfoPanel } from '@/components/chat/GroupInfoPanel';
import {
  api,
  ConversationDetail,
  ConversationListItem as ApiConversation,
  Message,
} from '@/lib/api';
import { MockConversation } from '@/lib/mock-data';

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { subscribe, send } = useSocket();

  const conversationId = useMemo(() => {
    const raw = params?.id;
    const num = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
    return isNaN(num) ? 1 : num;
  }, [params]);

  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  // typingUsers: user_id -> display name (for users currently typing in this conversation)
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
  const typingTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Toast for messages received in other conversations
  const [incomingToast, setIncomingToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch conversations list for sidebar
  const fetchSidebarConversations = useCallback(async () => {
    try {
      const list = await api.getConversations();
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversation list:', err);
    }
  }, []);

  // Fetch conversation detail + messages
  const fetchChatData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [detail, msgList] = await Promise.all([
        api.getConversation(conversationId),
        api.getMessages(conversationId),
      ]);

      setConversationDetail(detail);
      setMessages(msgList);

      // Auto-mark the last incoming message as read
      const lastIncomingMsg = [...msgList].reverse().find((m) => m.sender_id !== user?.id);
      if (lastIncomingMsg) {
        api.markMessageRead(lastIncomingMsg.id).catch((e) =>
          console.warn('Could not mark message read:', e)
        );
      }
    } catch (err: any) {
      console.error('Failed to load chat data:', err);
      setError(err?.message || 'Failed to load messages for this conversation.');
    } finally {
      setLoading(false);
    }
  }, [conversationId, user?.id]);

  useEffect(() => {
    fetchSidebarConversations();
    fetchChatData();
  }, [fetchSidebarConversations, fetchChatData]);

  // Derive sender name map early — needed by WS typing handler below
  const senderNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (conversationDetail?.members) {
      for (const m of conversationDetail.members) {
        if (m.user) {
          map[m.user_id] = m.user.display_name || m.user.username || `User ${m.user_id}`;
        }
      }
    }
    return map;
  }, [conversationDetail]);

  // ------------------------------------------------------------------
  // WebSocket: live message:new
  // ------------------------------------------------------------------
  useEffect(() => {
    const unsubNew = subscribe<WsMessageNew>('message:new', (ev) => {
      if (ev.message.conversation_id !== conversationId) {
        // Message is for a DIFFERENT conversation — show a toast
        setConversations((prev) => {
          const src = prev.find((c) => c.id === ev.message.conversation_id);
          const name = src?.name || 'Another conversation';
          // Clear any existing toast timer
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          setIncomingToast(`New message in ${name}`);
          toastTimerRef.current = setTimeout(() => setIncomingToast(null), 4000);
          // Also update that conversation's preview
          return prev.map((c) =>
            c.id === ev.message.conversation_id
              ? { ...c, last_message_preview: ev.message.content ?? '', last_message_at: ev.message.created_at }
              : c
          );
        });
        return;
      }
      setMessages((prev) => {
        // Deduplicate by id (sender might have added it optimistically)
        if (prev.some((m) => m.id === ev.message.id)) return prev;
        return [...prev, ev.message as Message];
      });
      // Update sidebar last_message_at
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, last_message_preview: ev.message.content ?? '', last_message_at: ev.message.created_at }
            : c
        )
      );
    });

    // WebSocket: message:status (update tick status on bubbles if needed)
    const unsubStatus = subscribe<WsMessageStatus>('message:status', (_ev) => {
      // No-op for now; MessageBubble status prop can be extended later
    });

    // WebSocket: typing:update
    const unsubTyping = subscribe<WsTypingUpdate>('typing:update', (ev) => {
      if (ev.conversation_id !== conversationId) return;
      if (ev.user_id === user?.id) return; // skip own indicator

      const name = senderNameMap[ev.user_id] ?? `User ${ev.user_id}`;

      if (ev.is_typing) {
        setTypingUsers((prev) => new Map(prev).set(ev.user_id, name));
        // Auto-clear after 4 s (in case typing:stop is missed)
        if (typingTimersRef.current.has(ev.user_id)) {
          clearTimeout(typingTimersRef.current.get(ev.user_id)!);
        }
        typingTimersRef.current.set(
          ev.user_id,
          setTimeout(() => {
            setTypingUsers((prev) => { const m = new Map(prev); m.delete(ev.user_id); return m; });
          }, 4000)
        );
      } else {
        if (typingTimersRef.current.has(ev.user_id)) {
          clearTimeout(typingTimersRef.current.get(ev.user_id)!);
          typingTimersRef.current.delete(ev.user_id);
        }
        setTypingUsers((prev) => { const m = new Map(prev); m.delete(ev.user_id); return m; });
      }
    });

    return () => { unsubNew(); unsubStatus(); unsubTyping(); };
  }, [subscribe, conversationId, user?.id, senderNameMap]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending: use WS when connected (message:new will update state),
  // fall back to HTTP if WS is offline.
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;
    if (signalWS.isConnected) {
      // WS path — message:new subscriber will append to state
      send({
        type: 'message:send',
        conversation_id: conversationId,
        content: text.trim(),
        reply_to: null,
      });
    } else {
      // HTTP fallback — add to state directly
      try {
        setIsSending(true);
        const newMsg = await api.sendMessage(conversationId, { content: text.trim() });
        setMessages((prev) => [...prev, newMsg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, last_message_preview: text.trim(), last_message_at: newMsg.created_at }
              : c
          )
        );
      } catch (err: any) {
        console.error('Failed to send message:', err);
        alert(err?.message || 'Failed to send message. Please try again.');
      } finally {
        setIsSending(false);
      }
    }
  };

  // Typing handler: relay to WS
  const handleTypingChange = (isTyping: boolean) => {
    send(isTyping
      ? { type: 'typing:start', conversation_id: conversationId }
      : { type: 'typing:stop', conversation_id: conversationId }
    );
  };

  // Filter conversations for left sidebar
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.last_message_preview && c.last_message_preview.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Final displayed conversations (applying unread filter if active)
  const displayedConversations = useMemo(() => {
    if (unreadOnly) {
      return filteredConversations.filter((c) => (c.unread_count || 0) > 0);
    }
    return filteredConversations;
  }, [filteredConversations, unreadOnly]);

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0),
    [conversations]
  );

  const chatTitle =
    conversationDetail?.name ||
    (conversationDetail?.type === 'direct' ? 'Direct Message' : 'Conversation');

  return (
    <div className="flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-primary)] overflow-hidden transition-colors">
      {/* ---------------- Left Sidebar: Conversation List (Desktop) ---------------- */}
      <aside className="hidden md:flex w-80 lg:w-[350px] flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] shrink-0 h-full transition-colors">
        {/* Top Header: Chats title & actions matching exact Signal screenshot */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight">Chats</h1>
          <div className="flex items-center gap-1">
            {/* Compose / New Chat button */}
            <button
              id="new-chat-modal-btn"
              onClick={() => setIsNewChatModalOpen(true)}
              title="New chat"
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors active:scale-95"
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
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors active:scale-95"
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
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors active:scale-95"
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
              className="w-full bg-[var(--input-bg)] text-[var(--text-primary)] text-[14px] rounded-full pl-9 pr-3 py-1.5 placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-signal-blue transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
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
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
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
          <div className="px-5 py-1 text-[13px] text-[var(--text-muted)]">
            Filtered by unread
          </div>
        )}

        {/* Scrollable Conversations List */}
        <div className="flex-1 overflow-y-auto px-1 py-1 space-y-0.5">
          {/* Empty State when Filtered */}
          {unreadOnly && displayedConversations.length === 0 && (
            <div className="py-16 text-center px-4 flex flex-col items-center justify-center gap-3">
              <p className="text-[15px] font-medium text-[var(--text-primary)]">No unread chats</p>
              <button
                onClick={() => setUnreadOnly(false)}
                className="px-4 py-1.5 rounded-full bg-[var(--bg-pill)] hover:bg-[var(--bg-active)] text-[var(--text-primary)] text-[13px] font-medium transition-colors"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Empty State when search matches nothing */}
          {!unreadOnly && displayedConversations.length === 0 && (
            <div className="py-16 text-center text-[var(--text-secondary)] text-xs px-4">
              {searchQuery ? 'No matching conversations found.' : 'No conversations yet.'}
            </div>
          )}

          {displayedConversations.map((conv) => {
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
                isSelected={conv.id === conversationId}
                onClick={() => router.push(`/chats/${conv.id}`)}
              />
            );
          })}
        </div>
      </aside>

      {/* ---------------- Right Chat Pane ---------------- */}
      <main className="flex-1 flex flex-row h-full overflow-hidden">
        <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden">
          {/* Chat Header */}
          <ChatHeader
            name={chatTitle}
            avatarUrl={conversationDetail?.avatar_url}
            isOnline={conversationDetail?.type === 'direct'}
            type={conversationDetail?.type}
            memberCount={conversationDetail?.members?.length}
            onBack={() => router.push('/chats')}
            onInfoClick={() => setIsGroupInfoOpen((prev) => !prev)}
          />

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-start space-y-1">
            {/* E2EE Info Banner */}
            <div className="mx-auto max-w-sm text-center py-2 px-4 rounded-panel bg-bg-panel/40 border border-neutral-800/60 text-xs text-text-secondary leading-relaxed mb-4 select-none">
              🔒 Messages and calls are end-to-end encrypted. No one outside of this chat, not even
              Signal, can read or listen to them.
            </div>

            {/* Loading Skeletons */}
            {loading && (
              <div className="space-y-3 py-4 animate-pulse">
                <div className="flex justify-start">
                  <div className="h-10 w-48 rounded-bubble bg-bg-panel/50" />
                </div>
                <div className="flex justify-end">
                  <div className="h-10 w-56 rounded-bubble bg-accent-blue/30" />
                </div>
                <div className="flex justify-start">
                  <div className="h-12 w-64 rounded-bubble bg-bg-panel/50" />
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="m-auto max-w-sm p-4 rounded-panel bg-red-500/10 border border-red-500/30 text-center">
                <p className="text-xs text-red-400 mb-2 leading-relaxed">{error}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchChatData}
                  className="text-xs py-1 px-3"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Empty Conversation State */}
            {!loading && !error && messages.length === 0 && (
              <div className="my-auto text-center py-8 text-text-secondary text-xs">
                No messages yet. Send a message to start the conversation!
              </div>
            )}

            {/* Render Real Message Bubbles */}
            {!loading &&
              !error &&
              messages.map((msg) => {
                const isSentByMe = msg.sender_id === (user?.id || 1);
                const senderDisplayName =
                  !isSentByMe && conversationDetail?.type === 'group'
                    ? senderNameMap[msg.sender_id] || `User ${msg.sender_id}`
                    : undefined;

                return (
                  <MessageBubble
                    key={msg.id}
                    id={msg.id}
                    content={msg.content}
                    timestamp={msg.created_at}
                    isSent={isSentByMe}
                    status="delivered"
                    senderName={senderDisplayName}
                    isDeleted={msg.is_deleted}
                  />
                );
              })}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer wired to real handleSendMessage + typing */}
          <TypingIndicator typingNames={Array.from(typingUsers.values())} />
          <Composer
            onSend={handleSendMessage}
            onTypingChange={handleTypingChange}
            disabled={loading || !!error}
            placeholder={`Message ${chatTitle}...`}
          />
        </div>

        {/* Group Info Panel */}
        {conversationDetail?.type === 'group' && isGroupInfoOpen && (
          <GroupInfoPanel
            conversation={conversationDetail}
            currentUserId={user?.id || 0}
            currentUserRole={
              (conversationDetail.members.find((m) => m.user_id === user?.id)?.role as
                | 'admin'
                | 'member') || 'member'
            }
            onClose={() => setIsGroupInfoOpen(false)}
            onMemberRemoved={fetchChatData}
          />
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
        onGroupCreated={() => fetchSidebarConversations()}
      />
    </div>
  );
}
