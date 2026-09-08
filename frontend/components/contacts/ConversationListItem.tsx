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
      className={`group relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-[12px] cursor-pointer select-none transition-all duration-150 ${
        isSelected
          ? 'bg-[#28282A] text-white shadow-sm'
          : 'hover:bg-[#232426] text-text-primary active:scale-[0.99]'
      }`}
    >
      {/* Avatar with status indicator */}
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
          <span className="text-[14px] font-semibold text-text-primary truncate">
            {conversation.name}
          </span>
          {timeStr && (
            <span
              className={`text-[11px] shrink-0 font-normal ${
                conversation.unread_count > 0
                  ? 'text-signal-blue font-medium'
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
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full bg-signal-blue text-white shadow-sm shrink-0">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
