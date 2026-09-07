'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(true);

  // Read current theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('signal-theme');
    setIsDark(saved !== 'light');
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('signal-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('signal-theme', 'light');
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-dark text-text-primary overflow-y-auto">
      {/* Header */}
      <header className="px-6 py-5 border-b border-neutral-800/80 bg-bg-dark/80 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
        <p className="text-xs text-text-secondary mt-0.5">Manage your account and preferences</p>
      </header>

      <div className="flex-1 max-w-xl w-full mx-auto px-6 py-8 space-y-6">

        {/* Profile Card */}
        <section className="rounded-panel bg-bg-panel border border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Profile
            </span>
          </div>
          <div className="flex items-center gap-4 p-4">
            <Avatar
              name={user?.display_name || user?.username || 'Signal User'}
              src={user?.avatar_url}
              size="lg"
              isOnline={user?.is_online ?? true}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {user?.display_name || 'Signal User'}
              </p>
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {user?.phone_number || (user?.username ? `@${user.username}` : '')}
              </p>
              {user?.status_message && (
                <p className="text-xs text-text-secondary truncate mt-0.5 italic">
                  &ldquo;{user.status_message}&rdquo;
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-panel bg-bg-panel border border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Appearance
            </span>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Dark Mode</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
              </p>
            </div>

            {/* Toggle switch */}
            <button
              id="dark-mode-toggle"
              role="switch"
              aria-checked={isDark}
              onClick={toggleTheme}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors duration-200 focus:outline-none
                focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2
                focus-visible:ring-offset-bg-panel
                ${isDark ? 'bg-accent-blue' : 'bg-neutral-600'}
              `}
            >
              <span className="sr-only">Toggle dark mode</span>
              <span
                className={`
                  inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200
                  ${isDark ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Theme preview chips */}
          <div className="flex items-center gap-2 px-4 pb-4">
            <button
              onClick={() => { if (!isDark) return; toggleTheme(); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !isDark
                  ? 'bg-accent-blue/15 border-accent-blue text-accent-blue'
                  : 'border-neutral-700 text-text-secondary hover:text-text-primary'
              }`}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => { if (isDark) return; toggleTheme(); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isDark
                  ? 'bg-accent-blue/15 border-accent-blue text-accent-blue'
                  : 'border-neutral-700 text-text-secondary hover:text-text-primary'
              }`}
            >
              🌙 Dark
            </button>
          </div>
        </section>

        {/* Privacy & Security (placeholder) */}
        <section className="rounded-panel bg-bg-panel border border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Privacy &amp; Security
            </span>
          </div>
          <div className="px-4 py-4 space-y-3 text-sm text-text-secondary">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="w-4 h-4 text-online-green shrink-0">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>End-to-end encryption is always on</span>
            </div>
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="w-4 h-4 text-online-green shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Signal never stores your messages</span>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded-panel bg-bg-panel border border-red-500/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-500/20">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
              Account
            </span>
          </div>
          <div className="px-4 py-4">
            <Button
              id="settings-logout-btn"
              variant="secondary"
              size="sm"
              onClick={() => logout()}
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              Sign Out
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
