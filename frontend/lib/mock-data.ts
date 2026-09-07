/**
 * Mock conversations data matching the shape of ConversationListItem
 * from docs/api-contract.md and backend/app/schemas/conversation.py.
 */

export interface MockConversation {
  id: number;
  type: 'direct' | 'group';
  name: string;
  avatar_url: string | null;
  created_by: number | null;
  created_at: string;
  last_message_at: string | null;
  unread_count: number;
  last_message_preview: string | null;
  is_online?: boolean;
}

// Generate dynamic ISO strings relative to now so mock timestamps always look fresh
const now = Date.now();
const minutesAgo = (mins: number) => new Date(now - mins * 60 * 1000).toISOString();
const hoursAgo = (hrs: number) => new Date(now - hrs * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: 1,
    type: 'direct',
    name: 'Alice Chen',
    avatar_url: null,
    created_by: 1,
    created_at: daysAgo(5),
    last_message_at: minutesAgo(4),
    unread_count: 2,
    last_message_preview: 'See you at the coffee shop at 4:30 PM! ☕',
    is_online: true,
  },
  {
    id: 2,
    type: 'group',
    name: 'Signal Core Engineers',
    avatar_url: null,
    created_by: 2,
    created_at: daysAgo(14),
    last_message_at: minutesAgo(28),
    unread_count: 0,
    last_message_preview: 'Sarah: Just pushed the WebSocket sync handler to staging.',
  },
  {
    id: 3,
    type: 'direct',
    name: 'Bob Miller',
    avatar_url: null,
    created_by: 3,
    created_at: daysAgo(10),
    last_message_at: hoursAgo(2),
    unread_count: 1,
    last_message_preview: 'Can you review the cryptographic keys specification?',
    is_online: false,
  },
  {
    id: 4,
    type: 'group',
    name: 'Weekend Cycling 🚴‍♂️',
    avatar_url: null,
    created_by: 1,
    created_at: daysAgo(20),
    last_message_at: hoursAgo(7),
    unread_count: 0,
    last_message_preview: 'Dave: Weather looks great tomorrow morning!',
  },
  {
    id: 5,
    type: 'direct',
    name: 'Emma Watson',
    avatar_url: null,
    created_by: 4,
    created_at: daysAgo(30),
    last_message_at: daysAgo(2),
    unread_count: 0,
    last_message_preview: 'Thanks for sending the document over!',
    is_online: true,
  },
];
