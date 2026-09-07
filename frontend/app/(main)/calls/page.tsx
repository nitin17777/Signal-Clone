'use client';

import React from 'react';

function ComingSoonPage({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col h-full bg-bg-dark text-text-primary">
      <header className="px-6 py-5 border-b border-neutral-800/80 shrink-0">
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-bg-panel border border-neutral-800 flex items-center justify-center text-accent-blue">
          {icon}
        </div>
        <div className="space-y-2 max-w-xs">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
          Coming Soon
        </span>
      </div>
    </div>
  );
}

export default function CallsPage() {
  return (
    <ComingSoonPage
      title="Calls"
      description="Voice and video calls with end-to-end encryption. Coming in a future update."
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="w-9 h-9">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      }
    />
  );
}
