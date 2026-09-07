'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export interface ComposerProps {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  onSend,
  placeholder = 'Send a message...',
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as text expands
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <footer className="p-3 border-t border-neutral-800/80 bg-bg-dark shrink-0 select-none">
      <div className="flex items-end gap-2 max-w-5xl mx-auto">
        {/* Attachment button placeholder */}
        <button
          type="button"
          disabled={disabled}
          title="Add attachment"
          className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-bg-panel transition-colors disabled:opacity-40"
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
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        {/* Textarea Input */}
        <div className="flex-1 min-w-0 rounded-bubble bg-bg-panel border border-neutral-700/60 focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue/30 transition-all px-4 py-2 flex items-center">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full bg-transparent text-[15px] leading-[1.4] text-text-primary placeholder:text-text-secondary resize-none focus:outline-none max-h-32 overflow-y-auto"
          />

          {/* Emoji button placeholder */}
          <button
            type="button"
            disabled={disabled}
            title="Insert emoji"
            className="p-1 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 ml-1 shrink-0"
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
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" x2="9.01" y1="9" y2="9" />
              <line x1="15" x2="15.01" y1="9" y2="9" />
            </svg>
          </button>
        </div>

        {/* Send Button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          size="md"
          className={`shrink-0 rounded-full w-10 h-10 p-0 flex items-center justify-center transition-transform active:scale-95 ${
            canSend
              ? 'bg-accent-blue hover:bg-accent-blue/90 text-white shadow-md'
              : 'bg-bg-panel text-text-secondary opacity-50 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 translate-x-0.5"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </Button>
      </div>
    </footer>
  );
};
