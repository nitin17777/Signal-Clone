'use client';

import React from 'react';

export default function StoriesPage() {
  return (
    <div className="flex flex-col h-full bg-bg-dark text-text-primary">
      <header className="px-6 py-5 border-b border-neutral-800/80 shrink-0">
        <h1 className="text-lg font-semibold text-text-primary">Stories</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-bg-panel border border-neutral-800 flex items-center justify-center text-accent-blue">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="w-9 h-9">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </div>
        <div className="space-y-2 max-w-xs">
          <h2 className="text-xl font-semibold text-text-primary">Stories</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Share moments that disappear after 24 hours. Coming in a future update.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
          Coming Soon
        </span>
      </div>
    </div>
  );
}
