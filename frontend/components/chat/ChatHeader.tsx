'use client';

import React from 'react';
import { Avatar } from '@/components/ui/Avatar';

export interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  statusText?: string;
  type?: 'direct' | 'group';
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatarUrl,
  isOnline,
  statusText,
  type = 'direct',
  onBack,
}) => {
  const subtitle =
    statusText ||
    (type === 'group'
      ? 'Group conversation'
      : isOnline
      ? 'Online'
      : 'Last seen recently');

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

        <Avatar
          name={name}
          src={avatarUrl}
          size="md"
          isOnline={type === 'direct' ? isOnline : undefined}
          className="shrink-0"
        />

        <div className="min-w-0 flex flex-col justify-center">
          <h1 className="text-[16px] font-semibold text-text-primary truncate leading-tight">
            {name}
          </h1>
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

      {/* Right side actions */}
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
  );
};
