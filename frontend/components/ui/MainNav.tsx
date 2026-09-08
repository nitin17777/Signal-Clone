'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/chats',
    label: 'Chats',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="w-[20px] h-[20px]">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/calls',
    label: 'Calls',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="w-[20px] h-[20px]">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    href: '/stories',
    label: 'Stories',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="w-[20px] h-[20px]">
        <rect x="3" y="3" width="13" height="18" rx="2" ry="2" />
        <path d="M16 8h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-1" />
      </svg>
    ),
  },
];

export const MainNav: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav
      id="main-nav"
      aria-label="Main navigation"
      className="hidden md:flex flex-col items-center justify-between py-3 px-2 w-[60px] shrink-0 border-r border-[#28282B] bg-[#18181A] h-full select-none z-20"
    >
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Hamburger Menu Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            title="Signal Menu"
            className="w-10 h-10 rounded-[8px] flex items-center justify-center text-[#9E9E9E] hover:text-white hover:bg-[#232426] active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              className="w-5 h-5">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* Desktop Menu Dropdown */}
          {showMenu && (
            <div className="absolute top-12 left-2 z-50 bg-[#1E1F22] border border-[#28282B] rounded-[14px] p-1.5 shadow-2xl w-48 text-xs text-text-primary flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 font-semibold border-b border-[#28282B] text-white flex items-center gap-2">
                <Avatar name={user?.display_name || 'User'} src={user?.avatar_url} size="sm" />
                <div className="truncate">
                  <p className="truncate">{user?.display_name || 'User'}</p>
                  <p className="text-[10px] text-[#9E9E9E] truncate">{user?.phone_number || ''}</p>
                </div>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowMenu(false)}
                className="px-3 py-2 rounded-md hover:bg-[#232426] transition-colors flex items-center gap-2"
              >
                <span>⚙️</span> Preferences / Settings
              </Link>
              <Link
                href="/linked-devices"
                onClick={() => setShowMenu(false)}
                className="px-3 py-2 rounded-md hover:bg-[#232426] transition-colors flex items-center gap-2"
              >
                <span>📱</span> Linked Devices
              </Link>
              <button
                onClick={() => { setShowMenu(false); logout(); }}
                className="px-3 py-2 rounded-md hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-2 text-left"
              >
                <span>🚪</span> Log Out
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items (Chats, Calls, Stories) */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {NAV_ITEMS.map((item) => {
            const isActive =
              (item.href === '/chats' && (pathname === '/chats' || pathname.startsWith('/chats/'))) ||
              (item.href !== '/chats' && (pathname === item.href || pathname.startsWith(item.href + '/')));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`
                  flex items-center justify-center w-11 h-9 rounded-[10px] transition-all duration-150 active:scale-95
                  ${isActive
                    ? 'bg-[#323336] text-white shadow-sm'
                    : 'text-[#9E9E9E] hover:text-white hover:bg-[#232426]'
                  }
                `}
              >
                {item.icon}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Settings Gear */}
      <Link
        href="/settings"
        title="Settings"
        className={`
          flex items-center justify-center w-11 h-9 rounded-[10px] transition-all duration-150 active:scale-95
          ${pathname.startsWith('/settings')
            ? 'bg-[#323336] text-white shadow-sm'
            : 'text-[#9E9E9E] hover:text-white hover:bg-[#232426]'
          }
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="w-5 h-5">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </Link>
    </nav>
  );
};
