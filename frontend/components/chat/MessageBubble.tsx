'use client';

import React, { useState } from 'react';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageBubbleProps {
  id?: number;
  content: string | null;
  timestamp: string;
  isSent: boolean;
  status?: MessageStatus;
  senderName?: string;
  isDeleted?: boolean;
  onReply?: (content: string) => void;
  onReact?: (emoji: string) => void;
  onDelete?: () => void;
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
      <span title="Sent" className="text-white/80 inline-flex items-center">
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
      <span title="Delivered" className="text-white/85 inline-flex items-center -space-x-2">
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
    // Double white-cyan checkmark (Signal Read receipt)
    return (
      <span title="Read" className="text-white inline-flex items-center -space-x-2 drop-shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5 font-bold"
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
          className="w-3.5 h-3.5 font-bold"
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
  onReply,
  onReact,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const time = formatMessageTime(timestamp);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReactionClick = (emoji: string) => {
    setReaction((prev) => (prev === emoji ? null : emoji));
    onReact?.(emoji);
  };

  return (
    <div
      className={`group relative w-full flex my-1 px-2 select-text ${
        isSent ? 'justify-end' : 'justify-start'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Floating Action Pill on Hover */}
      {showActions && !isDeleted && (
        <div
          className={`absolute top-[-26px] z-10 flex items-center gap-1 bg-[#242528]/95 backdrop-blur-md border border-neutral-700/70 rounded-full px-2 py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100 ${
            isSent ? 'right-4' : 'left-4'
          }`}
        >
          {/* Quick reactions */}
          {['❤️', '👍', '😂', '😮', '😢'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className="text-xs hover:scale-125 hover:bg-white/10 rounded-full p-0.5 transition-transform"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}

          <div className="w-[1px] h-3 bg-neutral-700 mx-0.5" />

          {/* Reply */}
          {onReply && content && (
            <button
              onClick={() => onReply(content)}
              className="text-text-secondary hover:text-text-primary p-0.5 rounded transition-colors"
              title="Reply"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="9 17 4 12 9 7" />
                <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
              </svg>
            </button>
          )}

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="text-text-secondary hover:text-text-primary p-0.5 rounded transition-colors"
            title={copied ? 'Copied!' : 'Copy text'}
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Bubble container */}
      <div className="relative max-w-[85%] sm:max-w-[70%] md:max-w-[62%]">
        <div
          className={`relative px-3.5 py-2 shadow-sm transition-all duration-100 ${
            isSent
              ? 'bg-[#2C6BED] text-white rounded-[18px] rounded-br-[4px]'
              : 'bg-[#2E2E30] text-[#F2F2F2] rounded-[18px] rounded-bl-[4px] border border-neutral-700/40'
          }`}
        >
          {/* Sender name for received group messages */}
          {!isSent && senderName && (
            <p className="text-xs font-semibold text-[#64A3FF] mb-0.5 select-none">
              {senderName}
            </p>
          )}

          {/* Message text */}
          <div className="text-[15px] leading-[1.4] break-words whitespace-pre-wrap font-normal">
            {isDeleted ? (
              <span className="italic text-xs opacity-70 select-none flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 inline">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                This message was deleted
              </span>
            ) : (
              content
            )}
          </div>

          {/* Timestamp + Status footer */}
          <div
            className={`flex items-center gap-1 justify-end mt-0.5 select-none ${
              isSent ? 'text-white/75' : 'text-text-secondary'
            }`}
          >
            {time && <span className="text-[11px] font-normal">{time}</span>}
            {isSent && !isDeleted && status && <StatusIcon status={status} />}
          </div>
        </div>

        {/* Reaction Pill Badge */}
        {reaction && (
          <div
            onClick={() => handleReactionClick(reaction)}
            className={`absolute -bottom-2 cursor-pointer bg-[#202124] border border-neutral-700/80 rounded-full px-1.5 py-0.5 text-xs shadow-md hover:scale-110 transition-transform ${
              isSent ? 'right-2' : 'left-2'
            }`}
          >
            {reaction} <span className="text-[10px] text-text-secondary font-medium">1</span>
          </div>
        )}
      </div>
    </div>
  );
};
