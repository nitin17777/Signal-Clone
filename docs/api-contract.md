# API Contract

Base URL: `/api/v1`. All authenticated routes expect a JWT (httpOnly cookie or
`Authorization: Bearer` header).

## Auth
| Method | Endpoint             | Description                                 |
|--------|----------------------|----------------------------------------------|
| POST   | /auth/register       | Register with phone/username + display name |
| POST   | /auth/request-otp    | Sends mocked OTP (always `123456` in dev)    |
| POST   | /auth/verify-otp     | Verifies OTP, issues JWT session             |
| POST   | /auth/login          | Login existing user                          |
| POST   | /auth/logout         | Clears session                               |
| GET    | /auth/me             | Current user profile                         |

## Users & Contacts
| Method | Endpoint              | Description                     |
|--------|-----------------------|----------------------------------|
| GET    | /users/search?q=      | Search users by phone/username  |
| PATCH  | /users/me             | Update display name, avatar, status |
| GET    | /contacts             | List my contacts                |
| POST   | /contacts             | Add a contact                   |
| DELETE | /contacts/{id}        | Remove a contact                |

## Conversations
| Method | Endpoint                                | Description                              |
|--------|-------------------------------------------|---------------------------------------------|
| GET    | /conversations                            | List conversations, sorted by `last_message_at`, with unread counts + last message preview |
| POST   | /conversations/direct                     | Get-or-create a direct conversation with a user |
| POST   | /conversations/group                      | Create a group `{name, member_ids[]}`   |
| GET    | /conversations/{id}                       | Conversation detail + members            |
| PATCH  | /conversations/{id}                       | Rename group / change avatar (admin only)|
| POST   | /conversations/{id}/members               | Add member (admin only)                  |
| DELETE | /conversations/{id}/members/{user_id}     | Remove member (admin only)               |

## Messages
| Method | Endpoint                                       | Description                              |
|--------|--------------------------------------------------|---------------------------------------------|
| GET    | /conversations/{id}/messages?before=&limit=      | Paginated message history (cursor-based) |
| POST   | /conversations/{id}/messages                     | Send message (also broadcasts over WS)   |
| PATCH  | /messages/{id}/read                              | Mark message(s) as read                  |
| DELETE | /messages/{id}                                   | Soft-delete a message                    |
| POST   | /messages/{id}/reactions                         | Add/remove a reaction (bonus)            |

## Seed data spec
- 6 users with display names, phone numbers, placeholder avatars
- 2 direct conversations, 15–30 messages each, spanning several days, mixed
  sent/delivered/read statuses
- 2 groups with 4–5 members each, one member marked as admin
- At least one unread conversation per demo user