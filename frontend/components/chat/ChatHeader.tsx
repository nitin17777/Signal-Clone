'use client';

import React from 'react';
import { Avatar } from '@/components/ui/Avatar';

export interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  statusText?: string;
  type?: 'direct' | 'group';
  memberCount?: number;
  onBack?: () => void;
  /** For group conversations: clicking the name/avatar opens the info panel. */
  onInfoClick?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatarUrl,
  isOnline,
  statusText,
  type = 'direct',
  memberCount,
  onBack,
  onInfoClick,
}) => {
  const subtitle =
    statusText ||
    (type === 'group'
      ? memberCount != null
        ? `${memberCount} members`
        : 'Group conversation'
      : isOnline
      ? 'Online'
      : 'Last seen recently');

  const isGroup = type === 'group';

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/80 bg-bg-dark/95 backdrop-blur-md shrink-0 select-none z-10">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
            aria-label="Back to conversations"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Clickable area for group info — wraps avatar + title */}
        <div
          id="chat-header-info-trigger"
          onClick={isGroup && onInfoClick ? onInfoClick : undefined}
          className={`flex items-center gap-3 min-w-0 ${
            isGroup && onInfoClick
              ? 'cursor-pointer rounded-lg px-1 -mx-1 hover:bg-bg-panel/40 transition-colors'
              : ''
          }`}
          title={isGroup && onInfoClick ? 'View group info' : undefined}
        >
          <Avatar
            name={name}
            src={avatarUrl}
            size="md"
            isOnline={type === 'direct' ? isOnline : undefined}
            className="shrink-0"
          />

          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[16px] font-semibold text-text-primary truncate leading-tight">
                {name}
              </h1>
              {/* Subtle chevron hint for groups */}
              {isGroup && onInfoClick && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 text-text-secondary shrink-0"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
            </div>
            <p
              className={`text-xs truncate ${
                isOnline && type === 'direct'
                  ? 'text-online-green font-medium'
                  : 'text-text-secondary'
              }`}
            >
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* E2EE badge */}
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

        {/* Group info button */}
        {isGroup && onInfoClick && (
          <button
            id="group-info-btn"
            onClick={onInfoClick}
            title="Group info"
            className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-panel transition-colors flex items-center justify-center"
            aria-label="Open group info"
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};
