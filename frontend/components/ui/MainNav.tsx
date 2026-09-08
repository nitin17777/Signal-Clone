'use client';

import React from 'react';
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
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        className="w-[22px] h-[22px]">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/calls',
    label: 'Calls',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        className="w-[22px] h-[22px]">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    href: '/stories',
    label: 'Stories',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        className="w-[22px] h-[22px]">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    href: '/linked-devices',
    label: 'Linked Devices',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        className="w-[22px] h-[22px]">
        <rect x="4" y="3" width="16" height="18" rx="2" ry="2" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        className="w-[22px] h-[22px]">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export const MainNav: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav
      id="main-nav"
      aria-label="Main navigation"
      className="hidden md:flex flex-col items-center justify-between py-3.5 px-2 w-[72px] shrink-0 border-r border-border-subtle/70 bg-[#161718] h-full select-none"
    >
      <div className="flex flex-col items-center gap-2 w-full">
        {/* Signal Brand Mark */}
        <Link
          href="/chats"
          title="Signal"
          className="w-10 h-10 rounded-full bg-signal-blue flex items-center justify-center mb-3 shrink-0 shadow-md shadow-signal-blue/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="w-5 h-5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </Link>

        {/* Nav Links */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/chats' && pathname.startsWith(item.href + '/')) || (item.href === '/chats' && pathname.startsWith('/chats'));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`
                  relative flex flex-col items-center justify-center p-2.5 rounded-[12px] w-12 h-12 transition-all duration-150
                  ${isActive
                    ? 'bg-signal-blue/15 text-signal-blue'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-panel/70'
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute -left-2 w-1 h-6 bg-signal-blue rounded-r-full" />
                )}
                {item.icon}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User profile avatar at bottom */}
      <Link
        href="/settings"
        title={user?.display_name || 'My Profile'}
        className="p-1 rounded-full hover:ring-2 hover:ring-signal-blue/50 transition-all"
      >
        <Avatar
          name={user?.display_name || user?.username || 'User'}
          src={user?.avatar_url}
          size="sm"
          isOnline={user?.is_online ?? true}
        />
      </Link>
    </nav>
  );
};
