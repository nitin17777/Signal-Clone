'use client';

import React from 'react';

export default function LinkedDevicesPage() {
  return (
    <div className="flex flex-col h-full bg-bg-dark text-text-primary">
      <header className="px-6 py-5 border-b border-neutral-800/80 shrink-0">
        <h1 className="text-lg font-semibold text-text-primary">Linked Devices</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-bg-panel border border-neutral-800 flex items-center justify-center text-accent-blue">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="w-9 h-9">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <div className="space-y-2 max-w-xs">
          <h2 className="text-xl font-semibold text-text-primary">Linked Devices</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Use Signal on multiple devices simultaneously. Coming in a future update.
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
