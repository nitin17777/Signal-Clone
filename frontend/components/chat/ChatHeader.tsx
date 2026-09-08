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
    <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/95 backdrop-blur-md shrink-0 select-none z-10 transition-colors">
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

        {/* Clickable area for profile info — wraps avatar + title */}
        <div
          id="chat-header-info-trigger"
          onClick={isGroup && onInfoClick ? onInfoClick : undefined}
          className={`flex items-center gap-3 min-w-0 ${
            isGroup && onInfoClick
              ? 'cursor-pointer rounded-lg px-1 -mx-1 hover:bg-bg-panel/50 transition-colors'
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
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Video Call */}
        <button
          type="button"
          title="Start video call"
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-panel/70 rounded-full transition-colors active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>

        {/* Voice Call */}
        <button
          type="button"
          title="Start voice call"
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-panel/70 rounded-full transition-colors active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>

        {/* Search inside chat */}
        <button
          type="button"
          title="Search conversation"
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-panel/70 rounded-full transition-colors active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Group info or More menu */}
        {isGroup && onInfoClick && (
          <button
            id="group-info-btn"
            onClick={onInfoClick}
            title="Group info"
            className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-panel/70 transition-colors flex items-center justify-center active:scale-95"
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
