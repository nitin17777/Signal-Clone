# Signal Clone

A privacy-focused, real-time messaging web application inspired by Signal. Built with a modern Next.js frontend and a FastAPI async backend, featuring real-time messaging via WebSockets, group management, responsive layout, and dark mode.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11+, SQLAlchemy 2.0 (AsyncIO), Pydantic v2, WebSockets
- **Authentication**: JWT stored in secure `httpOnly` cookies, bcrypt password hashing
- **Database**: SQLite (via `aiosqlite`) with Alembic migrations

---

## Architecture Overview

The system combines RESTful endpoints for CRUD, authentication, and conversation membership with a persistent, bidirectional WebSocket connection for low-latency events (messages, typing indicators, presence).

For full technical specifications, refer to the documentation in `docs/`:
- **Database Schema**: [`docs/schema.sql`](docs/schema.sql) — relational schema covering users, conversations, conversation members, messages, attachments, and reactions.
- **REST API Contract**: [`docs/api-contract.md`](docs/api-contract.md) — complete endpoint definitions, request/response models, and status codes.
- **WebSocket Contract**: [`docs/ws-contract.md`](docs/ws-contract.md) — protocol specification for client-to-server and server-to-client event types (`message:new`, `typing:update`, `presence:update`, etc.).
- **Design System**: [`docs/design-tokens.md`](docs/design-tokens.md) — design tokens, color palette, typography, and responsive layout guidelines.

---

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Linux/macOS
   python -m venv .venv
   source .venv/bin/activate

   # Windows (PowerShell)
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations / seed (optional)**:
   ```bash
   alembic upgrade head
   python -m app.seed.seed_data
   ```

5. **Start the development server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API will be available at `http://localhost:8000`. Interactive OpenAPI documentation is accessible at `http://localhost:8000/docs`.

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional, defaults provided in `.env`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Feature Matrix

| Feature | Status | Description |
|---|---|---|
| **Authentication** | ✅ Implemented | Register, Login, Logout with secure `httpOnly` JWT cookies |
| **Direct Messaging** | ✅ Implemented | 1-on-1 private chats with history loading and read tracking |
| **Group Chats** | ✅ Implemented | Group creation, multi-select member picker, admin-only member removal and renaming |
| **Real-time Messaging** | ✅ Implemented | Instant message delivery and updates via native WebSockets |
| **Typing Indicators** | ✅ Implemented | Ephemeral live typing indicators with auto-clear timeouts |
| **Conversation Search** | ✅ Implemented | Instant client-side search filtering by contact name or message preview |
| **Dark / Light Mode** | ✅ Implemented | Theme toggle in Settings with Tailwind `dark:` variants and `localStorage` persistence |
| **Responsive Layout** | ✅ Implemented | Single-pane mobile view with back button; two-pane desktop view |
| **Cross-Chat Toasts** | ✅ Implemented | Toast notifications for incoming messages while viewing another conversation |
| **Voice & Video Calls** | ⏳ Placeholder | "Coming Soon" screen linked from main navigation |
| **Disappearing Stories** | ⏳ Placeholder | "Coming Soon" screen linked from main navigation |
| **Linked Devices** | ⏳ Placeholder | "Coming Soon" screen linked from main navigation |
| **Cryptographic E2EE** | ⏳ Visual / Simulated | E2EE banner & encryption UI indicators (Signal Protocol key exchange not yet wired) |

---

## Testing

- **Frontend build check**:
  ```bash
  cd frontend && npm run build
  ```
- **Backend test suite**:
  ```bash
  cd backend && pytest
  ```
