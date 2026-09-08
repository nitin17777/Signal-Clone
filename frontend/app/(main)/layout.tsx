'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MainNav } from '@/components/ui/MainNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Apply saved theme preference before first render
  useEffect(() => {
    const applyTheme = () => {
      const saved = localStorage.getItem('signal-theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (saved === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const saved = localStorage.getItem('signal-theme');
      if (!saved || saved === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-signal-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-secondary)]">Loading Signal...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Authentic Signal Desktop Window Bar */}
      <div className="hidden md:flex items-center justify-between px-3 h-7 bg-[var(--topbar-bg)] border-b border-[var(--border-subtle)] select-none text-[12px] text-[var(--topbar-text)] shrink-0 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-signal-blue flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-2.5 h-2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="font-bold text-[var(--text-primary)] text-xs mr-2">Signal</span>
          <div className="flex items-center gap-3.5 text-[var(--topbar-text)] text-[11px]">
            <span className="hover:text-[var(--text-primary)] cursor-default transition-colors">File</span>
            <span className="hover:text-[var(--text-primary)] cursor-default transition-colors">Edit</span>
            <span className="hover:text-[var(--text-primary)] cursor-default transition-colors">View</span>
            <span className="hover:text-[var(--text-primary)] cursor-default transition-colors">Window</span>
            <span className="hover:text-[var(--text-primary)] cursor-default transition-colors">Help</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <MainNav />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
