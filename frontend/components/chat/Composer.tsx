'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface ComposerProps {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Called with true when user starts typing, false when they stop (3 s inactivity) */
  onTypingChange?: (isTyping: boolean) => void;
}

export const Composer: React.FC<ComposerProps> = ({
  onSend,
  placeholder = 'Signal message',
  disabled = false,
  onTypingChange,
}) => {
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChange?.(false);
    }
  }, [onTypingChange]);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingChange?.(true);
    }
    // Reset the 3 s inactivity timer
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, 3000);
  }, [onTypingChange, stopTyping]);

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

  // Click outside to close attachment menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    if (showAttachMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachMenu]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    stopTyping();
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

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const hasText = text.trim().length > 0;

  return (
    <footer className="p-3 bg-[#1B1C1D] border-t border-border-subtle/80 shrink-0 select-none">
      <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
        {/* Attachment menu popover */}
        {showAttachMenu && (
          <div
            ref={attachMenuRef}
            className="absolute bottom-14 left-0 z-30 bg-[#28282A] border border-neutral-700/80 rounded-[14px] p-2 shadow-2xl flex flex-col gap-1 w-48 animate-in fade-in zoom-in-95 duration-100"
          >
            <button
              onClick={() => { setShowAttachMenu(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <span className="w-8 h-8 rounded-full bg-blue-500/20 text-signal-blue flex items-center justify-center">
                🖼️
              </span>
              <span>Photos & Videos</span>
            </button>
            <button
              onClick={() => { setShowAttachMenu(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                📁
              </span>
              <span>Documents</span>
            </button>
            <button
              onClick={() => { setShowAttachMenu(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                👤
              </span>
              <span>Contact Card</span>
            </button>
          </div>
        )}

        {/* Attachment Button (+) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowAttachMenu((prev) => !prev)}
          title="Add attachment"
          className="p-2.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-bg-panel/80 transition-all duration-150 disabled:opacity-40 shrink-0 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Text Input Pill */}
        <div className="relative flex-1 min-w-0 rounded-[22px] bg-[#28282A] border border-neutral-700/60 focus-within:border-signal-blue focus-within:ring-1 focus-within:ring-signal-blue/40 transition-all px-4 py-2 flex items-center">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (e.target.value.trim()) handleTyping();
              else stopTyping();
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full bg-transparent text-[15px] leading-[1.4] text-text-primary placeholder:text-text-secondary resize-none focus:outline-none max-h-32 overflow-y-auto"
          />

          {/* Emoji / Sticker Button */}
          <div className="relative">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="Insert emoji"
              className="p-1 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 ml-1 shrink-0 active:scale-95"
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
                <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
                <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
              </svg>
            </button>

            {/* Quick Emoji Menu */}
            {showEmojiPicker && (
              <div className="absolute bottom-10 right-0 z-30 bg-[#28282A] border border-neutral-700/80 rounded-[14px] p-2 shadow-2xl grid grid-cols-6 gap-2 w-64 animate-in fade-in zoom-in-95 duration-100">
                {['😀', '😂', '😍', '🔥', '👍', '🙏', '🎉', '😎', '❤️', '🤔', '🥳', '✨', '👋', '💯', '🚀', '👀', '💡', '💪'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="text-lg hover:scale-125 hover:bg-white/10 rounded-lg p-1 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Voice Note / Send Button */}
        {hasText ? (
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled}
            className="shrink-0 rounded-full w-10 h-10 bg-signal-blue hover:bg-signal-blue-hover text-white flex items-center justify-center shadow-md active:scale-90 transition-all duration-150"
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
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              // Quick voice note placeholder
              onSend('🎤 [Voice Note - 0:04]');
            }}
            className="shrink-0 rounded-full w-10 h-10 bg-[#28282A] text-text-secondary hover:text-text-primary hover:bg-neutral-700/60 flex items-center justify-center active:scale-95 transition-all duration-150"
            title="Record voice note"
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
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
        )}
      </div>
    </footer>
  );
};
