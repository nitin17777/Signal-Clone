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
    const saved = localStorage.getItem('signal-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Default to dark (Signal vibe)
      document.documentElement.classList.add('dark');
      localStorage.setItem('signal-theme', 'dark');
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-secondary">Loading Signal...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-bg-dark">
      {/* Authentic Signal Desktop Window Bar */}
      <div className="hidden md:flex items-center justify-between px-3 h-7 bg-[#141516] border-b border-[#2C2D30]/60 select-none text-[12px] text-[#A0A2A8] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-signal-blue flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-2.5 h-2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="font-bold text-white text-xs mr-2">Signal</span>
          <div className="flex items-center gap-3.5 text-[#95979D] text-[11px]">
            <span className="hover:text-white cursor-default transition-colors">File</span>
            <span className="hover:text-white cursor-default transition-colors">Edit</span>
            <span className="hover:text-white cursor-default transition-colors">View</span>
            <span className="hover:text-white cursor-default transition-colors">Window</span>
            <span className="hover:text-white cursor-default transition-colors">Help</span>
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

