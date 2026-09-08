'use client';

import React, { useState } from 'react';

export default function CallsPage() {
  const [search, setSearch] = useState('');
  const [callLinkModalOpen, setCallLinkModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const mockLink = 'https://signal.group/#call_demo_token_xyz99';

  const copyCallLink = () => {
    navigator.clipboard.writeText(mockLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-full bg-[#1B1C1D] text-text-primary select-none overflow-hidden">
      {/* Calls Sidebar / List Pane */}
      <div className="w-full md:w-80 lg:w-[360px] flex flex-col border-r border-[#2C2D30]/80 h-full bg-[#1B1C1D]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Calls</h1>
          <div className="flex items-center gap-1">
            {/* New Call button */}
            <button
              title="New Call"
              className="p-2 text-[#A0A2A8] hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                <line x1="15" y1="3" x2="21" y2="3" />
                <line x1="18" y1="0" x2="18" y2="6" />
              </svg>
            </button>
            {/* More Menu */}
            <button
              title="More options"
              className="p-2 text-[#A0A2A8] hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar + Filter Icon */}
        <div className="px-4 pb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2C2D30] text-white text-[14px] rounded-full pl-9 pr-3 py-1.5 placeholder-[#8E9096] focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9096] pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          {/* Filter button */}
          <button
            title="Filter calls"
            className="p-1.5 text-[#8E9096] hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
          </button>
        </div>

        {/* Create a Call Link Action */}
        <div className="px-3 pt-2">
          <button
            onClick={() => setCallLinkModalOpen(true)}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-[12px] hover:bg-[#28282A] text-left transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#3B3C3E] flex items-center justify-center text-white shrink-0 group-hover:bg-[#48494C] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-white">Create a Call Link</span>
            </div>
          </button>
        </div>

        {/* Scrollable Calls List or Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-[17px] font-bold text-white mb-1">No calls</h2>
          <p className="text-[13px] text-[#8E9096]">Recent calls will appear here.</p>
        </div>
      </div>

      {/* Right Main Placeholder Pane */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#18191B] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#28282A] flex items-center justify-center text-[#8E9096] mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
        <h3 className="text-[16px] font-semibold text-white mb-1">Make a Call</h3>
        <p className="text-xs text-[#8E9096] max-w-xs leading-relaxed">
          Start end-to-end encrypted high-definition audio and video calls with any of your contacts.
        </p>
      </div>

      {/* Call Link Modal */}
      {callLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#28282A] border border-neutral-700/80 rounded-[16px] p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-white mb-2">Create a Call Link</h3>
            <p className="text-xs text-[#8E9096] mb-4">
              Anyone with this link can join your call on Signal with end-to-end encryption.
            </p>
            <div className="flex items-center gap-2 bg-[#1B1C1D] border border-neutral-700/60 rounded-xl p-2.5 mb-5">
              <span className="text-xs text-white font-mono truncate flex-1">{mockLink}</span>
              <button
                onClick={copyCallLink}
                className="px-3 py-1.5 rounded-lg bg-signal-blue hover:bg-signal-blue-hover text-white text-xs font-semibold shrink-0 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setCallLinkModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#8E9096] hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
