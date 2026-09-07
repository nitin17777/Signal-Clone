-- USERS
CREATE TABLE users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number    TEXT UNIQUE,              -- mocked, e.g. "+91XXXXXXXXXX"
    username        TEXT UNIQUE,
    display_name    TEXT NOT NULL,
    avatar_url      TEXT,
    password_hash   TEXT,                      -- optional if using OTP-only login
    status_message  TEXT DEFAULT '',           -- Signal "About" text
    is_online       BOOLEAN DEFAULT 0,
    last_seen_at    DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CONTACTS (one-directional; A adds B)
CREATE TABLE contacts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nickname        TEXT,                      -- optional local display name
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(owner_id, contact_user_id)
);

-- CONVERSATIONS (covers both 1:1 and group; type discriminates)
CREATE TABLE conversations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    type            TEXT NOT NULL CHECK (type IN ('direct', 'group')),
    name            TEXT,                      -- group name; NULL for direct
    avatar_url      TEXT,                      -- group avatar; NULL for direct
    created_by      INTEGER REFERENCES users(id),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_message_at DATETIME                    -- denormalized for fast sort-by-recent
);

-- CONVERSATION MEMBERS (junction table, works for direct + group)
CREATE TABLE conversation_members (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id     INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role                TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_read_message_id INTEGER,               -- drives unread-count calculation
    is_muted            BOOLEAN DEFAULT 0,
    UNIQUE(conversation_id, user_id)
);

-- MESSAGES
CREATE TABLE messages (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id     INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id           INTEGER NOT NULL REFERENCES users(id),
    content             TEXT,                   -- nullable if attachment-only
    reply_to_message_id INTEGER REFERENCES messages(id),   --