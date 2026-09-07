'use client';

import React, { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConversationListItem } from '@/components/contacts/ConversationListItem';
import { MOCK_CONVERSATIONS, MockConversation } from '@/lib/mock-data';

export default function ChatsPage() {
  const { user, logout } = useAuth();
  const [conversations] = useState<MockConversation[]>(MOCK_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<number | null>(MOCK_CONVERSATIONS[0]?.id ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

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
        c.name.toLowerCase().includes(query) ||
        (c.last_message_preview && c.last_message_preview.toLowerCase().includes(query))
    );
  }, [sortedConversations, searchQuery]);

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
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-neutral-800/80 bg-bg-dark shrink-0 h-full ${
          selectedId !== null ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Top bar: Current User profile & Actions */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800/80 bg-bg-dark/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={user?.display_name || user?.username || 'Signal User'}
              src={user?.avatar_url}
              size="md"
              isOnline={user?.is_online ?? true}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-text-primary truncate">
                  {user?.display_name || 'Signal User'}
                </span>
              </div>
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

        {/* Search Header */}
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

        {/* Conversation List Header */}
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

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="py-12 text-center text-text-secondary text-xs">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedId}
                onClick={() => setSelectedId(conv.id)}
              />
            ))
          )}
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
                  name={selectedConversation.name}
                  src={selectedConversation.avatar_url}
                  size="md"
                  isOnline={selectedConversation.is_online}
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-text-primary truncate">
                    {selectedConversation.name}
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
                    <span className="text-[10px] text-text-secondary block text-right mt-1">
                      {new Date(selectedConversation.last_message_at).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Message input placeholder for upcoming phase */}
            <footer className="p-3 border-t border-neutral-800/80 bg-bg-dark shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  disabled
                  placeholder={`Message ${selectedConversation.name}... (messaging active in next phase)`}
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
