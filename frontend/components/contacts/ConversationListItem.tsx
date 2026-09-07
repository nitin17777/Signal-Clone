'use client';

import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { MockConversation } from '@/lib/mock-data';

export interface ConversationListItemProps {
  conversation: MockConversation;
  isSelected?: boolean;
  onClick?: () => void;
}

function formatTimestamp(isoString: string | null): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Same day
    if (now.toDateString() === date.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) {
      return 'Yesterday';
    }
    // Within 6 days
    if (diffDays < 6) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected = false,
  onClick,
}) => {
  const timeStr = formatTimestamp(conversation.last_message_at);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group flex items-center gap-3 px-3.5 py-3 rounded-panel cursor-pointer select-none transition-all duration-150 ${
        isSelected
          ? 'bg-bg-panel border border-neutral-700/60 shadow-sm'
          : 'hover:bg-bg-panel/60 border border-transparent active:bg-bg-panel/80'
      }`}
    >
      {/* Avatar */}
      <Avatar
        name={conversation.name}
        src={conversation.avatar_url}
        size="md"
        isOnline={conversation.is_online}
        className="shrink-0"
      />

      {/* Center + Right Details */}
      <div className="flex-1 min-w-0">
        {/* Name + Timestamp */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-semibold text-text-primary truncate">
            {conversation.name}
          </span>
          {timeStr && (
            <span
              className={`text-xs shrink-0 ${
                conversation.unread_count > 0
                  ? 'text-accent-blue font-medium'
                  : 'text-text-secondary'
              }`}
            >
              {timeStr}
            </span>
          )}
        </div>

        {/* Message preview + Unread Badge */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-xs truncate ${
              conversation.unread_count > 0
                ? 'text-text-primary font-medium'
                : 'text-text-secondary'
            }`}
          >
            {conversation.last_message_preview || 'No messages yet'}
          </p>

          {conversation.unread_count > 0 && (
            <Badge
              count={conversation.unread_count}
              variant="unread"
              className="shrink-0 animate-in fade-in zoom-in duration-200"
            />
          )}
        </div>
      </div>
    </div>
  );
};
