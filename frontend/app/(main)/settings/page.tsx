'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
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
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isDark, setIsDark] = useState(true);

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
    setIsDark(saved !== 'light');
  }, []);

  const toggleTheme = (dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('signal-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('signal-theme', 'light');
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
          <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" fillOpacity="0.4" />
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
    <div className="flex h-screen w-full bg-[#18191C] text-text-primary overflow-hidden">
      {/* ---------------- Left Sidebar: Settings Navigation ---------------- */}
      <aside className="w-full md:w-80 lg:w-[320px] flex flex-col border-r border-[#2C2D30]/80 bg-[#1B1C1D] shrink-0 h-full select-none">
        {/* Settings Header */}
        <div className="px-5 pt-4 pb-3">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Settings</h1>
        </div>

        {/* User Profile Card Item */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left flex items-center gap-3.5 px-3 py-3 rounded-[14px] transition-all duration-150 ${
              activeTab === 'profile'
                ? 'bg-[#38393C] text-white shadow-sm'
                : 'hover:bg-[#28282A] text-text-primary'
            }`}
          >
            {/* White circle avatar matching screenshot */}
            <div className="w-11 h-11 rounded-full bg-[#E5E6E8] text-[#1B1C1D] flex items-center justify-center font-bold text-[17px] shrink-0 shadow-sm">
              {user?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[15px] font-semibold text-white block truncate leading-tight">
                {user?.display_name || 'Signal User'}
              </span>
              <p className="text-[12px] text-[#A0A2A8] truncate mt-0.5">
                {user?.phone_number || (user?.username ? `@${user.username}` : 'No phone number')}
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
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-[10px] text-[14px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#38393C] text-white shadow-sm'
                    : 'text-[#E1E2E5] hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-[#A0A2A8]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ---------------- Right Content View ---------------- */}
      <main className="flex-1 h-full overflow-y-auto bg-[#18191C] px-6 md:px-12 py-8">
        <div className="max-w-xl mx-auto">
          {/* ================= PROFILE VIEW (Exact Match to User Screenshot) ================= */}
          {activeTab === 'profile' && (
            <div className="flex flex-col items-center animate-in fade-in duration-150">
              {/* Profile Title */}
              <h2 className="text-[17px] font-semibold text-white mb-6 text-center">Profile</h2>

              {/* Large White Avatar Circle */}
              <div className="relative mb-2">
                <div className="w-24 h-24 rounded-full bg-[#E5E6E8] text-[#1B1C1D] flex items-center justify-center font-bold text-3xl shadow-md select-none">
                  {displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>

              {/* Edit Photo Button */}
              <button
                type="button"
                onClick={() => alert('Photo upload dialog: You can change your avatar in upcoming sync.')}
                className="px-3.5 py-1 rounded-full bg-[#2C2D30] hover:bg-[#38393C] text-[12px] font-medium text-white transition-colors mb-8 active:scale-95"
              >
                Edit photo
              </button>

              {profileSuccessMsg && (
                <div className="w-full mb-4 p-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs text-center">
                  {profileSuccessMsg}
                </div>
              )}

              {/* Profile Form Fields */}
              <div className="w-full space-y-6 text-left">
                {/* Display Name Row */}
                <div className="flex items-start gap-3.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#A0A2A8] mt-1 shrink-0">
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
                          className="flex-1 bg-[#2C2D30] text-white text-[14px] px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-signal-blue"
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
                        <span className="text-[15px] font-medium text-white">{displayName || 'Set Name'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#8E9096] group-hover:text-white transition-colors">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* About / Status Row */}
                <div className="flex items-start gap-3.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#A0A2A8] mt-1 shrink-0">
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
                          className="flex-1 bg-[#2C2D30] text-white text-[14px] px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-signal-blue"
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
                        <span className="text-[14px] text-white">{statusMessage || 'About'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#8E9096] group-hover:text-white transition-colors">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </div>
                    )}
                    <p className="text-[12px] text-[#8E9096] mt-2 leading-relaxed">
                      Your profile and changes to it will be visible to people you message, contacts and groups.
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#2C2D30]/90 pt-6">
                  {/* Username Row */}
                  <div className="flex items-start gap-3.5">
                    <span className="text-[18px] text-[#A0A2A8] font-bold mt-0.5 shrink-0 select-none">@</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between py-0.5 cursor-pointer group">
                        <span className="text-[14px] text-white">
                          {user?.username ? `@${user.username}` : 'Username'}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#8E9096] group-hover:text-white transition-colors">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </div>
                      <p className="text-[12px] text-[#8E9096] mt-2 leading-relaxed">
                        People can now message you using your optional username so you don&apos;t have to give out your phone number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= APPEARANCE VIEW ================= */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-[20px] font-bold text-white mb-4">Appearance</h2>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] space-y-4">
                <span className="text-[14px] font-semibold text-white block">Theme</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => toggleTheme(false)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      !isDark
                        ? 'border-signal-blue bg-signal-blue/10 text-white'
                        : 'border-[#2C2D30] hover:border-neutral-500 text-[#A0A2A8]'
                    }`}
                  >
                    <span className="text-xl">☀️</span>
                    <span className="text-xs font-semibold">Light</span>
                  </button>

                  <button
                    onClick={() => toggleTheme(true)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      isDark
                        ? 'border-signal-blue bg-signal-blue/10 text-white'
                        : 'border-[#2C2D30] hover:border-neutral-500 text-[#A0A2A8]'
                    }`}
                  >
                    <span className="text-xl">🌙</span>
                    <span className="text-xs font-semibold">Dark</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] flex items-center justify-between">
                <div>
                  <span className="text-[14px] font-semibold text-white block">Chat Color</span>
                  <p className="text-[12px] text-[#8E9096] mt-0.5">Customize default speech bubble accent color</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-signal-blue ring-2 ring-white/20" />
                </div>
              </div>
            </div>
          )}

          {/* ================= GENERAL VIEW ================= */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-[20px] font-bold text-white mb-4">General</h2>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-white block">System Startup</span>
                    <p className="text-[12px] text-[#8E9096]">Open Signal automatically on computer startup</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-signal-blue w-4 h-4 cursor-pointer" />
                </div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-white block">App Version</span>
                    <p className="text-[12px] text-[#8E9096]">Signal Desktop Clone v7.0.0 (Production)</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-red-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[14px] font-medium text-red-400 block">Sign Out</span>
                  <p className="text-[12px] text-[#8E9096]">Log out of this device</p>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-4 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}

          {/* ================= NOTIFICATIONS VIEW ================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-[20px] font-bold text-white mb-4">Notifications</h2>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-white block">Sound Alerts</span>
                    <p className="text-[12px] text-[#8E9096]">Play audio chime for incoming messages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundNotifications}
                    onChange={(e) => setSoundNotifications(e.target.checked)}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#2C2D30]">
                  <div>
                    <span className="text-[14px] font-medium text-white block">Show Previews</span>
                    <p className="text-[12px] text-[#8E9096]">Display sender name and message in desktop toasts</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-signal-blue w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* ================= PRIVACY VIEW ================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-[20px] font-bold text-white mb-4">Privacy</h2>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-white block">Read Receipts</span>
                    <p className="text-[12px] text-[#8E9096]">See and share when messages have been read</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={readReceipts}
                    onChange={(e) => setReadReceipts(e.target.checked)}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#2C2D30]">
                  <div>
                    <span className="text-[14px] font-medium text-white block">Typing Indicators</span>
                    <p className="text-[12px] text-[#8E9096]">See and share when messages are being typed</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={typingIndicators}
                    onChange={(e) => setTypingIndicators(e.target.checked)}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] space-y-2">
                <span className="text-[14px] font-medium text-white block">End-to-End Encryption</span>
                <p className="text-[12px] text-[#8E9096] leading-relaxed">
                  All messages and media are end-to-end encrypted with the Signal Protocol. Keys are stored locally on your device.
                </p>
              </div>
            </div>
          )}

          {/* ================= CHATS VIEW ================= */}
          {activeTab === 'chats' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-[20px] font-bold text-white mb-4">Chats</h2>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-white block">Press Enter to Send</span>
                    <p className="text-[12px] text-[#8E9096]">Send message immediately on Enter keypress</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enterIsSend}
                    onChange={(e) => setEnterIsSend(e.target.checked)}
                    className="accent-signal-blue w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#2C2D30]">
                  <div>
                    <span className="text-[14px] font-medium text-white block">Auto-Download Media</span>
                    <p className="text-[12px] text-[#8E9096]">Automatically download incoming photos and audio</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-signal-blue w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* ================= CALLS VIEW ================= */}
          {activeTab === 'calls' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-[20px] font-bold text-white mb-4">Calls</h2>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-white block">Always Relay Calls</span>
                    <p className="text-[12px] text-[#8E9096]">Relay calls through Signal servers to avoid revealing your IP address to your contact.</p>
                  </div>
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
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-[20px] font-bold text-white mb-4">Data usage</h2>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-white">Messages Sent</span>
                  <span className="text-[13px] text-[#A0A2A8]">24.8 KB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-white">Messages Received</span>
                  <span className="text-[13px] text-[#A0A2A8]">51.2 KB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-white">Media Transferred</span>
                  <span className="text-[13px] text-[#A0A2A8]">1.2 MB</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= BACKUPS VIEW ================= */}
          {activeTab === 'backups' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-[20px] font-bold text-white mb-4">Backups</h2>

              <div className="p-4 rounded-[14px] bg-[#1F2022] border border-[#2C2D30] space-y-3">
                <span className="text-[14px] font-medium text-white block">Chat Backups</span>
                <p className="text-[12px] text-[#8E9096] leading-relaxed">
                  Backups are encrypted with a 30-digit passphrase and saved locally to your device.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => alert('Backup creation started. Encrypted archive exported.')}
                    className="px-4 py-2 rounded-lg bg-[#2C2D30] hover:bg-[#38393C] text-xs font-semibold text-white transition-colors"
                  >
                    Create Backup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= DONATE TO SIGNAL VIEW ================= */}
          {activeTab === 'donate' && (
            <div className="space-y-6 animate-in fade-in duration-150 text-center">
              <div className="w-16 h-16 rounded-full bg-signal-blue/20 text-signal-blue flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              <h2 className="text-[22px] font-bold text-white">Donate to Signal</h2>
              <p className="text-[13px] text-[#A0A2A8] max-w-sm mx-auto leading-relaxed">
                Signal is a non-profit dedicated to private, encrypted communication. Support open-source software with a contribution.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {['$3 / mo', '$5 / mo', '$10 / mo'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => alert(`Thank you for choosing ${tier} contribution!`)}
                    className="p-3.5 rounded-xl border border-[#2C2D30] bg-[#1F2022] hover:border-signal-blue text-white font-semibold text-sm transition-all active:scale-95"
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
