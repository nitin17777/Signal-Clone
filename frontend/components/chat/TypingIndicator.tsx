'use client';

import React from 'react';

interface TypingIndicatorProps {
  /** Names of users currently typing, e.g. ["Alice"] or ["Alice", "Bob"] */
  typingNames: string[];
}

/**
 * Shows an animated "X is typing…" pill below the message list.
 * Rendered only when typingNames is non-empty.
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingNames }) => {
  if (typingNames.length === 0) return null;

  const label =
    typingNames.length === 1
      ? `${typingNames[0]} is typing`
      : typingNames.length === 2
      ? `${typingNames[0]} and ${typingNames[1]} are typing`
      : 'Several people are typing';

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 select-none">
      {/* Animated dots bubble */}
      <div className="flex items-center gap-1 bg-bg-panel px-3 py-2 rounded-bubble rounded-bl-sm shadow-sm">
        <span
          className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1s' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce"
          style={{ animationDelay: '160ms', animationDuration: '1s' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce"
          style={{ animationDelay: '320ms', animationDuration: '1s' }}
        />
      </div>
      <span className="text-xs text-text-secondary italic">{label}…</span>
    </div>
  );
};
