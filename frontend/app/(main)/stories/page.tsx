'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface Story {
  id: string;
  author: string;
  avatar_url?: string | null;
  text?: string;
  image_url?: string;
  created_at: string;
  bg_gradient?: string;
}

const BG_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-pink-600',
  'from-emerald-600 to-teal-700',
  'from-orange-500 to-rose-600',
  'from-neutral-800 to-neutral-900',
];

export default function StoriesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);
  const [newStoryText, setNewStoryText] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(BG_GRADIENTS[0]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  const handleCreateStory = () => {
    if (!newStoryText.trim()) return;
    const newStory: Story = {
      id: Date.now().toString(),
      author: user?.display_name || 'My Story',
      avatar_url: user?.avatar_url,
      text: newStoryText.trim(),
      created_at: new Date().toISOString(),
      bg_gradient: selectedGradient,
    };
    setStories((prev) => [newStory, ...prev]);
    setNewStoryText('');
    setIsNewStoryModalOpen(false);
    setActiveStory(newStory);
  };

  const filteredStories = stories.filter((s) =>
    s.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.text && s.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-primary)] overflow-hidden">
      {/* ---------------- Left Sidebar: Stories List (Exact Match to Screenshot) ---------------- */}
      <aside className="w-full md:w-80 lg:w-[350px] flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] shrink-0 h-full select-none">
        {/* Header: Title + Actions */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight">Stories</h1>
          <div className="flex items-center gap-1">
            {/* New Story Plus Button */}
            <button
              id="new-story-btn"
              onClick={() => setIsNewStoryModalOpen(true)}
              title="New story"
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[19px] h-[19px]"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* More Menu */}
            <button
              title="More options"
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar matching screenshot */}
        <div className="px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-pill)] text-[var(--text-primary)] text-[14px] rounded-full pl-9 pr-3 py-1.5 placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 transition-all border border-transparent focus:border-[var(--border-subtle)]"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        {/* "My Story" Row matching screenshot */}
        <div className="px-2 pt-1 pb-2">
          <button
            onClick={() => setIsNewStoryModalOpen(true)}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-[12px] hover:bg-[var(--bg-hover)] transition-all text-left group active:scale-[0.99]"
          >
            {/* Circle avatar with blue plus indicator */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-[var(--avatar-bg)] text-[var(--avatar-text)] flex items-center justify-center font-bold text-[17px] shadow-sm">
                {user?.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-signal-blue ring-2 ring-[var(--bg-sidebar)] flex items-center justify-center text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-2.5 h-2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[15px] font-semibold text-[var(--text-primary)] block truncate leading-tight">
                My Story
              </span>
              <p className="text-[13px] text-[var(--text-secondary)] truncate mt-0.5">
                Add a story
              </p>
            </div>
          </button>
        </div>

        {/* Stories List or Empty State */}
        <div className="flex-1 flex flex-col overflow-y-auto px-2">
          {filteredStories.length > 0 ? (
            <div className="space-y-1 pt-2">
              <div className="px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Recent updates
              </div>
              {filteredStories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setActiveStory(story)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all text-left ${
                    activeStory?.id === story.id
                      ? 'bg-[var(--bg-active)] text-[var(--text-primary)]'
                      : 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="relative p-0.5 rounded-full ring-2 ring-signal-blue shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[var(--avatar-bg)] text-[var(--avatar-text)] flex items-center justify-center font-bold text-sm">
                      {story.author.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">{story.author}</p>
                    <p className="text-[12px] text-[var(--text-secondary)] truncate">
                      {new Date(story.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Centered "No stories" Empty State matching screenshot */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-10">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">No stories</h2>
              <p className="text-[13px] text-[var(--text-secondary)]">New updates will appear here.</p>
            </div>
          )}
        </div>
      </aside>

      {/* ---------------- Right Pane: Story Viewer or Empty Placeholder ---------------- */}
      <main className="hidden md:flex flex-1 items-center justify-center h-full bg-[var(--bg-main)] p-6 select-none">
        {activeStory ? (
          <div className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 bg-gradient-to-br transition-all animate-in zoom-in-95 duration-200">
            {/* Story Progress bar */}
            <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden mb-4">
              <div className="bg-white h-full w-full animate-pulse" />
            </div>

            {/* Story Author Header */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs">
                  {activeStory.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-sm font-semibold block">{activeStory.author}</span>
                  <span className="text-[10px] text-white/70">
                    {new Date(activeStory.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveStory(null)}
                className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Story Content */}
            <div className="my-auto text-center px-4">
              <p className="text-xl font-bold text-white leading-relaxed drop-shadow-md">
                {activeStory.text}
              </p>
            </div>

            {/* Bottom Quick Reactions */}
            <div className="flex items-center justify-center gap-3 pt-4">
              {['❤️', '👍', '🔥', '😂', '😮'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => alert(`Reacted with ${emoji}`)}
                  className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-[var(--text-secondary)] flex flex-col items-center gap-3 max-w-xs">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <rect x="3" y="3" width="13" height="18" rx="2" ry="2" />
                <path d="M16 8h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-1" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Signal Stories</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Select a story to view updates, or create a story to share with your contacts.
            </p>
            <button
              onClick={() => setIsNewStoryModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-full bg-signal-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm active:scale-95"
            >
              Create a Story
            </button>
          </div>
        )}
      </main>

      {/* ---------------- New Story Modal ---------------- */}
      <Modal
        isOpen={isNewStoryModalOpen}
        onClose={() => setIsNewStoryModalOpen(false)}
        title="Create Story"
      >
        <div className="space-y-4 pt-1">
          {/* Story Preview with Background Gradient */}
          <div className={`w-full h-44 rounded-xl bg-gradient-to-br ${selectedGradient} p-4 flex items-center justify-center text-center shadow-inner transition-all`}>
            <textarea
              rows={3}
              value={newStoryText}
              onChange={(e) => setNewStoryText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent text-white placeholder-white/60 font-semibold text-lg text-center resize-none focus:outline-none"
              autoFocus
            />
          </div>

          {/* Color Gradient Palette Picker */}
          <div>
            <span className="text-xs font-medium text-[var(--text-secondary)] block mb-2">Choose Background</span>
            <div className="flex items-center gap-2">
              {BG_GRADIENTS.map((grad) => (
                <button
                  key={grad}
                  type="button"
                  onClick={() => setSelectedGradient(grad)}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${grad} transition-all ${
                    selectedGradient === grad ? 'ring-2 ring-signal-blue scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsNewStoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateStory}
              disabled={!newStoryText.trim()}
            >
              Share Story
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
