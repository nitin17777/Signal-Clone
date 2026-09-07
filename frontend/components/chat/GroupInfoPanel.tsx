'use client';

import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
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
      className="w-72 lg:w-80 flex flex-col border-l border-neutral-800/80 bg-bg-dark h-full shrink-0 animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800/80">
        <h2 className="text-sm font-semibold text-text-primary">Group Info</h2>
        <button
          onClick={onClose}
          id="close-group-info-btn"
          className="p-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-panel transition-colors"
          aria-label="Close group info"
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
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Group avatar + name */}
      <div className="flex flex-col items-center gap-3 py-6 px-4 border-b border-neutral-800/60">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-blue/60 to-purple-500/60 flex items-center justify-center border-2 border-neutral-700">
            {conversation.avatar_url ? (
              <img
                src={conversation.avatar_url}
                alt={conversation.name || 'Group'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white select-none">
                {(conversation.name || 'G').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          {/* Group icon badge */}
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-bg-panel border border-neutral-700 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-text-secondary"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-text-primary">
            {conversation.name || 'Group'}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Members
          </p>
        </div>

        {error && (
          <div className="mx-4 mb-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-panel px-3 py-2">
            {error}
          </div>
        )}

        <ul className="px-2 pb-4 space-y-0.5">
          {conversation.members.map((member) => {
            const name =
              member.user?.display_name ||
              member.user?.username ||
              `User ${member.user_id}`;
            const isMe = member.user_id === currentUserId;
            const isRemoving = removingId === member.user_id;
            const canRemove = currentUserRole === 'admin' && !isMe;

            return (
              <li
                key={member.user_id}
                className="flex items-center gap-3 px-2 py-2.5 rounded-panel hover:bg-bg-panel/50 transition-colors group"
              >
                <Avatar
                  name={name}
                  src={member.user?.avatar_url}
                  size="sm"
                  isOnline={member.user?.is_online}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-text-primary truncate">
                      {name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] text-text-secondary shrink-0">
                        (you)
                      </span>
                    )}
                  </div>
                  {/* Role badge */}
                  <span
                    className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 ${
                      member.role === 'admin'
                        ? 'bg-accent-blue/15 text-accent-blue'
                        : 'bg-neutral-800 text-text-secondary'
                    }`}
                  >
                    {member.role}
                  </span>
                </div>

                {/* Remove button — admin only, not self */}
                {canRemove && (
                  <button
                    id={`remove-member-${member.user_id}`}
                    onClick={() => handleRemove(member)}
                    disabled={isRemoving}
                    title={`Remove ${name}`}
                    className="p-1.5 rounded-full text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    aria-label={`Remove ${name} from group`}
                  >
                    {isRemoving ? (
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    )}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};
