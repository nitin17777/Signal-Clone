'use client';

import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { api, ConversationDetail, ConversationMember } from '@/lib/api';

export interface GroupInfoPanelProps {
  conversation: ConversationDetail;
  currentUserId: number;
  /** 'admin' | 'member' — the current user's role in this group */
  currentUserRole: 'admin' | 'member';
  onClose: () => void;
  /** Called after a member is removed so caller can re-fetch detail */
  onMemberRemoved?: () => void;
}

export const GroupInfoPanel: React.FC<GroupInfoPanelProps> = ({
  conversation,
  currentUserId,
  currentUserRole,
  onClose,
  onMemberRemoved,
}) => {
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disappearingOff, setDisappearingOff] = useState(true);

  const handleRemove = async (member: ConversationMember) => {
    if (!window.confirm(`Remove ${member.user?.display_name || `User ${member.user_id}`} from the group?`)) return;
    try {
      setError(null);
      setRemovingId(member.user_id);
      await api.removeConversationMember(conversation.id, member.user_id);
      onMemberRemoved?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove member.');
    } finally {
      setRemovingId(null);
    }
  };

  const memberCount = conversation.members.length;

  return (
    <aside
      id="group-info-panel"
      className="w-full md:w-[380px] lg:w-[440px] flex flex-col border-l border-[#2C2D30]/80 bg-[#1F2022] h-full shrink-0 overflow-y-auto select-none animate-in slide-in-from-right duration-150"
    >
      {/* Top Bar with Back Chevron */}
      <div className="flex items-center px-4 pt-3 pb-1 shrink-0">
        <button
          onClick={onClose}
          id="close-group-info-btn"
          className="p-1.5 -ml-1 text-[#A0A2A8] hover:text-white rounded-lg transition-colors"
          aria-label="Back to chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Group avatar + name + description */}
      <div className="flex flex-col items-center px-6 pt-2 pb-5 text-center">
        {/* Large White Avatar with Group Icon */}
        <div className="w-24 h-24 rounded-full bg-white text-[#58595B] flex items-center justify-center shadow-lg mb-3">
          {conversation.avatar_url ? (
            <img
              src={conversation.avatar_url}
              alt={conversation.name || 'Group'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#58595B"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          )}
        </div>

        {/* Group Name */}
        <h2 className="text-[22px] font-bold text-white tracking-tight leading-tight mb-1">
          {conversation.name || 'Group'}
        </h2>

        {/* Group description */}
        <button className="text-[13px] text-[#8E9096] hover:text-white transition-colors cursor-pointer">
          Add group description...
        </button>

        {/* Action Buttons: Video, Mute, Search */}
        <div className="flex items-center justify-center gap-6 mt-5">
          {/* Video */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              title="Video Call"
              className="w-11 h-11 rounded-full bg-[#343538] hover:bg-[#404145] text-white flex items-center justify-center transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </button>
            <span className="text-[11px] text-[#A0A2A8]">Video</span>
          </div>

          {/* Mute */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              title="Mute Notifications"
              className="w-11 h-11 rounded-full bg-[#343538] hover:bg-[#404145] text-white flex items-center justify-center transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </button>
            <span className="text-[11px] text-[#A0A2A8]">Mute</span>
          </div>

          {/* Search */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              title="Search"
              className="w-11 h-11 rounded-full bg-[#343538] hover:bg-[#404145] text-white flex items-center justify-center transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <span className="text-[11px] text-[#A0A2A8]">Search</span>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-[#2C2D30] mx-4" />

      {/* Settings Options List */}
      <div className="px-4 py-3 space-y-1">
        {/* Disappearing messages */}
        <div className="flex items-start justify-between py-2.5 px-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
          <div className="flex items-start gap-3.5 pr-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#A0A2A8] mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <p className="text-[14px] font-medium text-white">Disappearing messages</p>
              <p className="text-[11px] text-[#8E9096] leading-relaxed mt-0.5">
                When enabled, messages sent and received in this group will disappear after they&apos;ve been seen.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDisappearingOff((p) => !p)}
            className="flex items-center gap-1 text-[12px] bg-[#2C2D30] text-white px-2.5 py-1 rounded-md shrink-0 hover:bg-[#38393C] transition-colors"
          >
            <span>{disappearingOff ? 'Off' : '1 day'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Chat color */}
        <div className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
          <div className="flex items-center gap-3.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#A0A2A8] shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <p className="text-[14px] font-medium text-white">Chat color</p>
          </div>
          <span className="w-4 h-4 rounded-full bg-signal-blue shadow-sm shrink-0" />
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
          <div className="flex items-center gap-3.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#A0A2A8] shrink-0">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <p className="text-[14px] font-medium text-white">Notifications</p>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-[#2C2D30] mx-4" />

      {/* Members Section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between py-2 px-2">
          <span className="text-[14px] font-bold text-white">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>
          <button title="Search members" className="p-1 text-[#A0A2A8] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* + Add members button */}
        <button className="w-full flex items-center gap-3.5 py-2.5 px-2 hover:bg-white/5 rounded-xl transition-colors text-left text-white group">
          <div className="w-9 h-9 rounded-full bg-[#343538] flex items-center justify-center text-white shrink-0 group-hover:bg-[#404145] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="text-[14px] font-medium">Add members</span>
        </button>

        {error && (
          <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-panel px-3 py-2">
            {error}
          </div>
        )}

        {/* Members List */}
        <div className="mt-1 space-y-1">
          {conversation.members.map((member) => {
            const isMe = member.user_id === currentUserId;
            const name = isMe
              ? 'You'
              : member.user?.display_name || member.user?.username || `User ${member.user_id}`;
            const isAdmin = member.role === 'admin' || isMe;
            const isRemoving = removingId === member.user_id;
            const canRemove = currentUserRole === 'admin' && !isMe;

            return (
              <div
                key={member.id || member.user_id}
                className="flex items-center justify-between py-2 px-2 hover:bg-white/5 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white text-[#58595B] flex items-center justify-center shrink-0 font-semibold text-xs">
                    {member.user?.avatar_url ? (
                      <img src={member.user.avatar_url} alt={name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-white truncate">{name}</p>
                    {isMe && (
                      <p className="text-[11px] text-[#8E9096] hover:text-white cursor-pointer truncate">
                        Add member label &gt;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <span className="text-[11px] text-[#8E9096] font-normal">Admin</span>
                  )}
                  {canRemove && (
                    <button
                      onClick={() => handleRemove(member)}
                      disabled={isRemoving}
                      title="Remove from group"
                      className="text-xs text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isRemoving ? '...' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
