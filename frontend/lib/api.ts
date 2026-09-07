/**
 * Frontend API client for Signal Clone.
 * Wraps all endpoints defined in docs/api-contract.md.
 * Automatically sends credentials: 'include' for httpOnly cookie authentication.
 */

export function getApiBaseUrl(): string {
  let raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      raw = 'https://signal-clone-x1x8.onrender.com';
    } else if (process.env.NODE_ENV === 'production') {
      raw = 'https://signal-clone-x1x8.onrender.com';
    } else {
      raw = 'http://localhost:8000';
    }
  } else if (typeof window !== 'undefined' && window.location.protocol === 'https:' && raw.startsWith('http://localhost')) {
    raw = 'https://signal-clone-x1x8.onrender.com';
  }
  return raw.trim().replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
}

export const API_BASE_URL = getApiBaseUrl();
export const BASE_PATH = `${API_BASE_URL}/api/v1`;


export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_PATH}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // essential for cookie auth
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    let errorData: any = null;
    try {
      errorData = await response.json();
      if (typeof errorData?.detail === 'string') {
        errorDetail = errorData.detail;
      } else if (Array.isArray(errorData?.detail)) {
        errorDetail = errorData.detail.map((e: any) => e.msg).join(', ');
      }
    } catch {
      // Body not JSON
    }
    throw new ApiError(response.status, errorDetail || `Request failed with status ${response.status}`, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: number;
  phone_number: string | null;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  status_message: string;
  is_online: boolean;
  last_seen_at: string | null;
  created_at: string;
}

export interface ConversationListItem {
  id: number;
  type: 'direct' | 'group';
  name: string | null;
  avatar_url: string | null;
  created_by: number | null;
  created_at: string;
  last_message_at: string | null;
  unread_count: number;
  last_message_preview: string | null;
  is_online?: boolean;
}

export interface ConversationMember {
  id: number;
  conversation_id: number;
  user_id: number;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_message_id: number | null;
  is_muted: boolean;
  user?: User;
}

export interface ConversationDetail extends ConversationListItem {
  members: ConversationMember[];
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string | null;
  reply_to_message_id: number | null;
  is_deleted: boolean;
  created_at: string;
  attachments?: any[];
  reactions?: any[];
}

export interface Contact {
  id: number;
  user_id: number;
  contact_user_id: number;
  nickname: string | null;
  created_at: string;
  contact_user?: User;
}

// ============================================================================
// API Methods
// ============================================================================

export const api = {
  // --- Auth ---
  async requestOtp(phoneNumber: string): Promise<{ status: string; message: string }> {
    return request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
  },

  async verifyOtp(phoneNumber: string, code: string): Promise<{ status: string; user: User }> {
    return request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber, code }),
    });
  },

  async register(data: {
    phone_number?: string;
    username?: string;
    password?: string;
    display_name: string;
  }): Promise<{ status: string; user: User }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(username: string, password?: string): Promise<{ status: string; user: User }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async logout(): Promise<void> {
    return request('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<User> {
    return request('/auth/me', {
      method: 'GET',
    });
  },

  // --- Users & Contacts ---
  async searchUsers(q: string): Promise<User[]> {
    return request(`/users/search?q=${encodeURIComponent(q)}`, {
      method: 'GET',
    });
  },

  async updateMe(data: {
    display_name?: string;
    avatar_url?: string;
    status_message?: string;
  }): Promise<User> {
    return request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getContacts(): Promise<Contact[]> {
    return request('/contacts', {
      method: 'GET',
    });
  },

  async addContact(contactUserId: number, nickname?: string): Promise<Contact> {
    return request('/contacts', {
      method: 'POST',
      body: JSON.stringify({ contact_user_id: contactUserId, nickname }),
    });
  },

  async removeContact(contactId: number): Promise<void> {
    return request(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  },

  // --- Conversations ---
  async getConversations(): Promise<ConversationListItem[]> {
    return request<ConversationListItem[]>('/conversations', {
      method: 'GET',
    });
  },

  async getConversation(id: number): Promise<ConversationDetail> {
    return request<ConversationDetail>(`/conversations/${id}`, {
      method: 'GET',
    });
  },

  async createDirectConversation(otherUserId: number): Promise<ConversationListItem> {
    return request<ConversationListItem>('/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ other_user_id: otherUserId }),
    });
  },

  async createGroupConversation(data: {
    name: string;
    avatar_url?: string;
    member_ids: number[];
  }): Promise<ConversationDetail> {
    return request<ConversationDetail>('/conversations/group', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateConversation(
    id: number,
    data: { name?: string; avatar_url?: string }
  ): Promise<ConversationListItem> {
    return request<ConversationListItem>(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async addConversationMember(conversationId: number, userId: number): Promise<void> {
    return request(`/conversations/${conversationId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  async removeConversationMember(conversationId: number, userId: number): Promise<void> {
    return request(`/conversations/${conversationId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  // --- Messages ---
  async getMessages(
    conversationId: number,
    params?: { before?: number; limit?: number }
  ): Promise<Message[]> {
    const query = new URLSearchParams();
    if (params?.before !== undefined) query.set('before', params.before.toString());
    if (params?.limit !== undefined) query.set('limit', params.limit.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Message[]>(`/conversations/${conversationId}/messages${qs}`, {
      method: 'GET',
    });
  },

  async sendMessage(
    conversationId: number,
    data: { content?: string; reply_to_message_id?: number }
  ): Promise<Message> {
    return request<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async markMessageRead(messageId: number): Promise<void> {
    return request(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  },

  async deleteMessage(messageId: number): Promise<void> {
    return request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  },
};
