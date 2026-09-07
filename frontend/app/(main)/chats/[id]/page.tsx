'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConversationListItem } from '@/components/contacts/ConversationListItem';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Composer } from '@/components/chat/Composer';
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
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending new message via real API
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;
    try {
      setIsSending(true);
      const newMsg = await api.sendMessage(conversationId, { content: text.trim() });
      setMessages((prev) => [...prev, newMsg]);

      // Update sidebar conversation preview
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

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0),
    [conversations]
  );

  // Derive sender name map for group chats
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

  const chatTitle =
    conversationDetail?.name ||
    (conversationDetail?.type === 'direct' ? 'Direct Message' : 'Conversation');

  return (
    <div className="flex h-screen w-full bg-bg-dark text-text-primary overflow-hidden">
      {/* ---------------- Left Sidebar: Conversation List (Desktop) ---------------- */}
      <aside className="hidden md:flex w-80 lg:w-96 flex-col border-r border-neutral-800/80 bg-bg-dark shrink-0 h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800/80 bg-bg-dark/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={user?.display_name || user?.username || 'Signal User'}
              src={user?.avatar_url}
              size="md"
              isOnline={user?.is_online ?? true}
            />
            <div className="min-w-0">
              <span className="text-sm font-semibold text-text-primary truncate block">
                {user?.display_name || 'Signal User'}
              </span>
              <p className="text-xs text-text-secondary truncate">
                {user?.phone_number || (user?.username ? `@${user.username}` : 'Online')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              title="New Conversation"
              className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-panel transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => logout()}
              className="text-xs px-2.5 py-1"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-800/50">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-bg-panel/70 text-xs py-1.5"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Chats
          </span>
          {totalUnread > 0 && (
            <Badge variant="unread" count={totalUnread}>
              {totalUnread} unread
            </Badge>
          )}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {filteredConversations.map((conv) => {
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
      <main className="flex-1 flex flex-col h-full bg-[#18191C] overflow-hidden">
        {/* Chat Header */}
        <ChatHeader
          name={chatTitle}
          avatarUrl={conversationDetail?.avatar_url}
          isOnline={conversationDetail?.type === 'direct'}
          type={conversationDetail?.type}
          onBack={() => router.push('/chats')}
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

        {/* Composer wired to real handleSendMessage */}
        <Composer
          onSend={handleSendMessage}
          disabled={loading || !!error || isSending}
          placeholder={`Message ${chatTitle}...`}
        />
      </main>

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
    </div>
  );
}
