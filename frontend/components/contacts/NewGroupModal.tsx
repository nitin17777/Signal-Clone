'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { api, User } from '@/lib/api';

export interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a group is successfully created so the sidebar can refresh. */
  onGroupCreated?: (groupId: number) => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
}) => {
  const router = useRouter();

  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial contacts/users when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsSearching(true);
      api.searchUsers('')
        .then((results) => {
          setSearchResults(results);
        })
        .catch(() => {
          // silent
        })
        .finally(() => {
          setIsSearching(false);
        });
    }
  }, [isOpen]);

  /** Debounced user search */
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await api.searchUsers(value.trim());
        setSearchResults(results);
      } catch {
        // silent
      } finally {
        setIsSearching(false);
      }
    }, 250);
  }, []);

  const toggleMember = (user: User) => {
    setSelectedMembers((prev) => {
      const already = prev.find((m) => m.id === user.id);
      return already ? prev.filter((m) => m.id !== user.id) : [...prev, user];
    });
  };

  const isSelected = (userId: number) =>
    selectedMembers.some((m) => m.id === userId);

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name.');
      return;
    }
    if (selectedMembers.length < 1) {
      setError('Please add at least 1 member.');
      return;
    }
    try {
      setError(null);
      setIsCreating(true);
      const group = await api.createGroupConversation({
        name: groupName.trim(),
        member_ids: selectedMembers.map((m) => m.id),
      });
      handleClose();
      onGroupCreated?.(group.id);
      router.push(`/chats/${group.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMembers([]);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Group">
      <div className="space-y-4">
        {/* Group name */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-medium">
            Group Name
          </label>
          <Input
            id="new-group-name"
            placeholder="e.g. Weekend Plans 🎉"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Member search */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-medium">
            Add Members
          </label>
          <div className="relative">
            <Input
              id="new-group-member-search"
              placeholder="Search by username or phone…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {isSearching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs animate-pulse">
                …
              </span>
            )}
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <ul className="mt-2 max-h-40 overflow-y-auto rounded-panel border border-neutral-800 bg-bg-panel divide-y divide-neutral-800">
              {searchResults.map((user) => {
                const selected = isSelected(user.id);
                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => toggleMember(user)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                        selected
                          ? 'bg-accent-blue/10 hover:bg-accent-blue/20'
                          : 'hover:bg-neutral-700/40'
                      }`}
                    >
                      <Avatar
                        name={user.display_name || user.username || '?'}
                        src={user.avatar_url}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm text-text-primary truncate">
                          {user.display_name || user.username}
                        </span>
                        {user.username && (
                          <span className="block text-xs text-text-secondary truncate">
                            @{user.username}
                          </span>
                        )}
                      </div>
                      {selected && (
                        <svg
                          className="w-4 h-4 text-accent-blue shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Selected member chips */}
        {selectedMembers.length > 0 && (
          <div>
            <p className="text-xs text-text-secondary mb-1.5 font-medium">
              Selected ({selectedMembers.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedMembers.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 bg-accent-blue/15 border border-accent-blue/30 text-accent-blue text-xs rounded-full px-2.5 py-1"
                >
                  {m.display_name || m.username}
                  <button
                    type="button"
                    onClick={() => toggleMember(m)}
                    className="hover:text-red-400 transition-colors leading-none"
                    aria-label={`Remove ${m.display_name || m.username}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-panel px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            id="create-group-btn"
            variant="primary"
            size="sm"
            onClick={handleCreate}
            disabled={isCreating || !groupName.trim() || selectedMembers.length < 1}
          >
            {isCreating ? 'Creating…' : 'Create Group'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
