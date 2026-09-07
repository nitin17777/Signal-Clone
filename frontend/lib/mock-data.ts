/**
 * Mock conversations and messages data matching the shape of ConversationListItem
 * and MessageRead from docs/api-contract.md and backend schemas.
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

export interface MockMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name?: string;
  content: string | null;
  reply_to_message_id?: number | null;
  is_deleted?: boolean;
  created_at: string;
  status?: 'sent' | 'delivered' | 'read';
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

export const MOCK_MESSAGES_BY_CONVERSATION: Record<number, MockMessage[]> = {
  1: [
    {
      id: 101,
      conversation_id: 1,
      sender_id: 2,
      sender_name: 'Alice Chen',
      content: 'Hey! Are we still meeting today?',
      created_at: hoursAgo(3),
      status: 'read',
    },
    {
      id: 102,
      conversation_id: 1,
      sender_id: 1, // current user
      sender_name: 'You',
      content: 'Yes, absolutely! Does afternoon work for you?',
      created_at: hoursAgo(2),
      status: 'read',
    },
    {
      id: 103,
      conversation_id: 1,
      sender_id: 2,
      sender_name: 'Alice Chen',
      content: 'Perfect! How about Blue Tokai?',
      created_at: minutesAgo(45),
      status: 'read',
    },
    {
      id: 104,
      conversation_id: 1,
      sender_id: 1,
      sender_name: 'You',
      content: 'Sounds great. Let us do 4:30 PM.',
      created_at: minutesAgo(15),
      status: 'delivered',
    },
    {
      id: 105,
      conversation_id: 1,
      sender_id: 2,
      sender_name: 'Alice Chen',
      content: 'See you at the coffee shop at 4:30 PM! ☕',
      created_at: minutesAgo(4),
      status: 'sent',
    },
  ],
  2: [
    {
      id: 201,
      conversation_id: 2,
      sender_id: 3,
      sender_name: 'Dave',
      content: 'Did anyone test the new end-to-end ratchet protocol?',
      created_at: hoursAgo(4),
      status: 'read',
    },
    {
      id: 202,
      conversation_id: 2,
      sender_id: 1,
      sender_name: 'You',
      content: 'Tested it this morning. All unit tests and double ratchet handshakes passed.',
      created_at: hoursAgo(2),
      status: 'read',
    },
    {
      id: 203,
      conversation_id: 2,
      sender_id: 4,
      sender_name: 'Sarah',
      content: 'Sarah: Just pushed the WebSocket sync handler to staging.',
      created_at: minutesAgo(28),
      status: 'read',
    },
  ],
  3: [
    {
      id: 301,
      conversation_id: 3,
      sender_id: 3,
      sender_name: 'Bob Miller',
      content: 'Hey Nitin, check out the updated schema docs when you get a chance.',
      created_at: hoursAgo(5),
      status: 'read',
    },
    {
      id: 302,
      conversation_id: 3,
      sender_id: 3,
      sender_name: 'Bob Miller',
      content: 'Can you review the cryptographic keys specification?',
      created_at: hoursAgo(2),
      status: 'delivered',
    },
  ],
};
