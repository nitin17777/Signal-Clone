'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

type SettingsTab =
  | 'profile'
  | 'general'
  | 'appearance'
  | 'chats'
  | 'calls'
  | 'notifications'
  | 'privacy'
  | 'data-usage'
  | 'backups'
  | 'donate';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [themeMode, setThemeMode] = useState<'system' | 'dark' | 'light'>('system');
  const [zoomLevel, setZoomLevel] = useState('100%');
  const [language, setLanguage] = useState('System Language');

  // Profile editing state
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [statusMessage, setStatusMessage] = useState(user?.status_message || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Appearance & other preferences
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [enterIsSend, setEnterIsSend] = useState(true);
  const [relayCalls, setRelayCalls] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setStatusMessage(user.status_message || '');
    }
  }, [user]);

  // Read current theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('signal-theme');
    if (saved === 'light') {
      setThemeMode('light');
      document.documentElement.classList.remove('dark');
    } else if (saved === 'dark') {
      setThemeMode('dark');
      document.documentElement.classList.add('dark');
    } else {
      setThemeMode('system');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const handleThemeChange = (mode: 'system' | 'dark' | 'light') => {
    setThemeMode(mode);
    if (mode === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('signal-theme', 'light');
    } else if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('signal-theme', 'dark');
    } else {
      localStorage.setItem('signal-theme', 'system');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const updated = await api.updateMe({
        display_name: displayName.trim() || undefined,
        status_message: statusMessage.trim() || undefined,
      });
      setUser(updated);
      setIsEditingName(false);
      setIsEditingAbout(false);
      setProfileSuccessMsg('Profile updated successfully');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      alert(err?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const navMenuItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'general',
      label: 'General',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" fillOpacity="0.6" />
        </svg>
      ),
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'calls',
      label: 'Calls',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      id: 'data-usage',
      label: 'Data usage',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      ),
    },
    {
      id: 'backups',
      label: 'Backups',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'donate',
      label: 'Donate to Signal',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-primary)] overflow-hidden transition-colors">
      {/* ---------------- Left Sidebar: Settings Navigation ---------------- */}
      <aside className="w-full md:w-80 lg:w-[320px] flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] shrink-0 h-full select-none transition-colors">
        {/* Settings Header */}
        <div className="px-5 pt-4 pb-3">
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
        </div>

        {/* User Profile Card Item */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left flex items-center gap-3.5 px-3 py-3 rounded-[14px] transition-all duration-150 ${
              activeTab === 'profile'
                ? 'bg-[var(--bg-active)] text-[var(--text-primary)] font-semibold shadow-sm'
                : 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
            }`}
          >
            {/* Circle avatar */}
            <div className="w-11 h-11 rounded-full bg-[var(--avatar-bg)] text-[var(--avatar-text)] flex items-center justify-center font-bold text-[17px] shrink-0 shadow-sm">
              {user?.display_name?.charAt(0).toUpperCase() || 'N'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[15px] font-semibold text-[var(--text-primary)] block truncate leading-tight">
                {user?.display_name || 'Nitin'}
              </span>
              <p className="text-[12px] text-[var(--text-secondary)] truncate mt-0.5">
                {user?.phone_number || (user?.username ? `@${user.username}` : '091190 91688')}
              </p>
            </div>
          </button>
        </div>

        {/* Settings Nav Menu List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {navMenuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--bg-active)] text-[var(--text-primary)] font-semibold shadow-sm'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <span className={`${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ---------------- Right Content View (Matching Screenshot Card Style) ---------------- */}
      <main className="flex-1 h-full overflow-y-auto bg-[var(--bg-main)] px-6 md:px-12 py-8 select-none transition-colors">
        <div className="max-w-xl mx-auto">
          {/* ================= APPEARANCE VIEW (Exact Match to User Screenshot) ================= */}
          {activeTab === 'appearance' && (
            <div className="animate-in fade-in duration-150">
              {/* Centered Header */}
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)] mb-6 text-center">Appearance</h2>

              {/* Floating Settings Card */}
              <div className="rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-5 shadow-sm transition-colors">
                {/* Language Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-[var(--text-secondary)]">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span className="text-[14px] text-[var(--text-primary)] font-normal">Language</span>
                  </div>
                  <button
                    onClick={() => alert('Language options: English (default)')}
                    className="flex items-center gap-1 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <span>{language}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                {/* Theme Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-[var(--text-secondary)]">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" fillOpacity="0.6" />
                    </svg>
                    <span className="text-[14px] text-[var(--text-primary)] font-normal">Theme</span>
                  </div>
                  <div className="relative">
                    <select
                      value={themeMode}
                      onChange={(e) => handleThemeChange(e.target.value as any)}
                      className="appearance-none bg-[var(--bg-pill)] text-[var(--text-primary)] text-[13px] font-medium px-4 py-1.5 pr-8 rounded-lg focus:outline-none cursor-pointer transition-colors"
                    >
                      <option value="system">System</option>
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Chat color Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-[var(--text-secondary)]">
                      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                    </svg>
                    <span className="text-[14px] text-[var(--text-primary)] font-normal">Chat color</span>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-signal-blue ring-2 ring-white/10" />
                </div>

                {/* Zoom level Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-[var(--text-secondary)]">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="text-[14px] text-[var(--text-primary)] font-normal">Zoom level</span>
                  </div>
                  <div className="relative">
                    <select
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(e.target.value)}
                      className="appearance-none bg-[var(--bg-pill)] text-[var(--text-primary)] text-[13px] font-medium px-4 py-1.5 pr-8 rounded-lg focus:outline-none cursor-pointer transition-colors"
                    >
                      <option value="80%">80%</option>
                      <option value="90%">90%</option>
                      <option value="100%">100%</option>
                      <option value="110%">110%</option>
                      <option value="125%">125%</option>
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PROFILE VIEW ================= */}
          {activeTab === 'profile' && (
            <div className="flex flex-col items-center animate-in fade-in duration-150">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)] mb-6 text-center">Profile</h2>

              {/* Large Avatar Circle */}
              <div className="relative mb-2">
                <div className="w-24 h-24 rounded-full bg-[var(--avatar-bg)] text-[var(--avatar-text)] flex items-center justify-center font-bold text-3xl shadow-md select-none">
                  {displayName?.charAt(0).toUpperCase() || 'N'}
                </div>
              </div>

              {/* Edit Photo Button */}
              <button
                type="button"
                onClick={() => alert('Photo upload dialog')}
                className="px-3.5 py-1 rounded-full bg-[var(--bg-pill)] hover:bg-[var(--bg-active)] text-[12px] font-medium text-[var(--text-primary)] transition-colors mb-8 active:scale-95"
              >
                Edit photo
              </button>

              {profileSuccessMsg && (
                <div className="w-full mb-4 p-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-xs text-center">
                  {profileSuccessMsg}
                </div>
              )}

              {/* Profile Form Fields */}
              <div className="w-full space-y-6 text-left">
                {/* Display Name Row */}
                <div className="flex items-start gap-3.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--text-secondary)] mt-1 shrink-0">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your Name"
                          className="flex-1 bg-[var(--bg-pill)] text-[var(--text-primary)] text-[14px] px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-signal-blue"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                          className="px-3 py-1.5 bg-signal-blue text-white text-xs font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setIsEditingName(true)}
                        className="group flex items-center justify-between cursor-pointer py-0.5"
                      >
                        <span className="text-[15px] font-medium text-[var(--text-primary)]">{displayName || 'Nitin'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* About / Status Row */}
                <div className="flex items-start gap-3.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--text-secondary)] mt-1 shrink-0">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    {isEditingAbout ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={statusMessage}
                          onChange={(e) => setStatusMessage(e.target.value)}
                          placeholder="About..."
                          className="flex-1 bg-[var(--bg-pill)] text-[var(--text-primary)] text-[14px] px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-signal-blue"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                          className="px-3 py-1.5 bg-signal-blue text-white text-xs font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setIsEditingAbout(true)}
                        className="group flex items-center justify-between cursor-pointer py-0.5"
                      >
                        <span className="text-[14px] text-[var(--text-primary)]">{statusMessage || 'About'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </div>
                    )}
                    <p className="text-[12px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Your profile and changes to it will be visible to people you message, contacts and groups.
                    </p>
                  </div>
                </div>

                <div className="border-t border-[var(--border-subtle)] pt-6">
                  {/* Username Row */}
                  <div className="flex items-start gap-3.5">
                    <span className="text-[18px] text-[var(--text-secondary)] font-bold mt-0.5 shrink-0 select-none">@</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between py-0.5 cursor-pointer group">
                        <span className="text-[14px] text-[var(--text-primary)]">
                          {user?.username ? `@${user.username}` : 'Username'}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </div>
                      <p className="text-[12px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                        People can now message you using your optional username so you don&apos;t have to give out your phone number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= GENERAL VIEW ================= */}
          {activeTab === 'general' && (
            <div className="animate-in fade-in duration-150">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)] mb-6 text-center">General</h2>
              <div className="rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-5 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[var(--text-primary)]">System Startup</span>
                  <input type="checkbox" defaultChecked className="accent-signal-blue w-4 h-4 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-[14px] text-[var(--text-primary)]">App Version</span>
                  <span className="text-[13px] text-[var(--text-secondary)]">Signal Desktop v7.0.0</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-[14px] text-red-500 font-medium">Sign Out</span>
                  <button
                    onClick={() => logout()}
                    className="px-3 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-500 text-xs font-semibold transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= NOTIFICATIONS VIEW ================= */}
          {activeTab === 'notifications' && (
            <div className="animate-in fade-in duration-150">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)] mb-6 text-center">Notifications</h2>
              <div className="rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-5 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[var(--text-primary)]">Sound Alerts</span>
                  <input
                    type="checkbox"
                    checked={soundNotifications}
                    onChange={(e) => setSoundNotifications(e.target.checked)}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-[14px] text-[var(--text-primary)]">Show Message Previews</span>
                  <input type="checkbox" defaultChecked className="accent-signal-blue w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* ================= PRIVACY VIEW ================= */}
          {activeTab === 'privacy' && (
            <div className="animate-in fade-in duration-150">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)] mb-6 text-center">Privacy</h2>
              <div className="rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-5 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[var(--text-primary)]">Read Receipts</span>
                  <input
                    type="checkbox"
                    checked={readReceipts}
                    onChange={(e) => setReadReceipts(e.target.checked)}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-[14px] text-[var(--text-primary)]">Typing Indicators</span>
                  <input
                    type="checkbox"
                    checked={typingIndicators}
                    onChange={(e) => setTypingIndicators(e.target.checked)}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= CHATS VIEW ================= */}
          {activeTab === 'chats' && (
            <div className="animate-in fade-in duration-150">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)] mb-6 text-center">Chats</h2>
              <div className="rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-5 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[var(--text-primary)]">Press Enter to Send</span>
                  <input
                    type="checkbox"
                    checked={enterIsSend}
                    onChange={(e) => setEnterIsSend(e.target.checked)}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-[14px] text-[var(--text-primary)]">Auto-Download Media</span>
                  <input type="checkbox" defaultChecked className="accent-signal-blue w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* ================= CALLS VIEW ================= */}
          {activeTab === 'calls' && (
            <div className="animate-in fade-in duration-150">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)] mb-6 text-center">Calls</h2>
              <div className="rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-5 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[var(--text-primary)]">Always Relay Calls</span>
                  <input
                    type="checkbox"
                    checked={relayCalls}
                    onChange={(e) => setRelayCalls(e.target.checked)}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= DATA USAGE VIEW ================= */}
          {activeTab === 'data-usage' && (
            <div className="animate-in fade-in duration-150">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)] mb-6 text-center">Data usage</h2>
              <div className="rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-4 shadow-sm transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[var(--text-primary)]">Sent Messages</span>
                  <span className="text-[13px] text-[var(--text-secondary)]">24.8 KB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[var(--text-primary)]">Received Messages</span>
                  <span className="text-[13px] text-[var(--text-secondary)]">51.2 KB</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= BACKUPS VIEW ================= */}
          {activeTab === 'backups' && (
            <div className="animate-in fade-in duration-150">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)] mb-6 text-center">Backups</h2>
              <div className="rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-4 shadow-sm transition-colors">
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  Backups are encrypted with a passphrase and saved locally to your device.
                </p>
                <button
                  onClick={() => alert('Backup created.')}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-pill)] hover:bg-[var(--bg-active)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
                >
                  Create Backup
                </button>
              </div>
            </div>
          )}

          {/* ================= DONATE VIEW ================= */}
          {activeTab === 'donate' && (
            <div className="animate-in fade-in duration-150 text-center">
              <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-2">Donate to Signal</h2>
              <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed mb-6">
                Signal is a non-profit dedicated to private, encrypted communication.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {['$3 / mo', '$5 / mo', '$10 / mo'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => alert(`Thank you for choosing ${tier} contribution!`)}
                    className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-signal-blue text-[var(--text-primary)] font-semibold text-sm transition-all shadow-sm"
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
