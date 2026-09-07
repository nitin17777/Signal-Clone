'use client';

import React from 'react';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageBubbleProps {
  id?: number;
  content: string | null;
  timestamp: string;
  isSent: boolean;
  status?: MessageStatus;
  senderName?: string;
  isDeleted?: boolean;
}

function formatMessageTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

/** Status tick icons matching Signal's receipt indicator styles */
const StatusIcon: React.FC<{ status: MessageStatus }> = ({ status }) => {
  if (status === 'sent') {
    // Single checkmark
    return (
      <span title="Sent" className="text-white/70 inline-flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            fillRule="evenodd"
            d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  if (status === 'delivered') {
    // Double checkmark (white/neutral)
    return (
      <span title="Delivered" className="text-white/80 inline-flex items-center -space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            fillRule="evenodd"
            d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            fillRule="evenodd"
            d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  if (status === 'read') {
    // Double blue/cyan checkmark (Read receipt)
    return (
      <span title="Read" className="text-sky-300 inline-flex items-center -space-x-2 font-bold">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            fillRule="evenodd"
            d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            fillRule="evenodd"
            d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  return null;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  timestamp,
  isSent,
  status = 'sent',
  senderName,
  isDeleted = false,
}) => {
  const time = formatMessageTime(timestamp);

  return (
    <div
      className={`w-full flex my-[2px] ${
        isSent ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[72%] md:max-w-[65%] px-3.5 py-2 shadow-sm transition-all duration-150 ${
          isSent
            ? 'bg-bubble-sent text-white rounded-bubble rounded-br-sm'
            : 'bg-bubble-received text-text-primary rounded-bubble rounded-bl-sm border border-neutral-800/40'
        }`}
      >
        {/* Sender name for received group messages */}
        {!isSent && senderName && (
          <p className="text-xs font-semibold text-accent-blue/90 mb-0.5 select-none">
            {senderName}
          </p>
        )}

        {/* Message body */}
        <div className="text-[15px] leading-[1.4] break-words whitespace-pre-wrap">
          {isDeleted ? (
            <span className="italic text-xs opacity-75 select-none">
              🚫 This message was deleted
            </span>
          ) : (
            content
          )}
        </div>

        {/* Timestamp + Status footer */}
        <div
          className={`flex items-center gap-1 justify-end mt-1 select-none ${
            isSent ? 'text-white/75' : 'text-text-secondary'
          }`}
        >
          {time && <span className="text-[11px]">{time}</span>}
          {isSent && !isDeleted && status && <StatusIcon status={status} />}
        </div>
      </div>
    </div>
  );
};
