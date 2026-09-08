# Signal Clone

<div align="center">

![Signal Clone](https://img.shields.io/badge/Signal-Clone-3A76F0?style=for-the-badge&logo=signal&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)

**A pixel-faithful, privacy-focused messaging web app — built to mirror the Signal desktop experience.**

[Live Demo](https://signal-clone-x1x8.onrender.com) · [API Docs](https://signal-clone-x1x8.onrender.com/docs) · [Report Bug](https://github.com)

</div>

---

## Overview

This is a full-stack Signal Desktop clone that replicates the authentic look, feel, and core functionality of the real Signal app. It features real-time messaging via WebSockets, group chat management, a faithful light/dark theme system, call and stories views, and a settings panel — all styled to match Signal's actual design language.

---

## ✨ Features

| Feature | Status | Notes |
|---|:---:|---|
| **User Registration & Login** | ✅ | Secure JWT auth via `httpOnly` cookies, bcrypt password hashing |
| **Direct Messaging** | ✅ | 1-on-1 private chats with full message history |
| **Group Chats** | ✅ | Create groups, pick members, rename, admin-only member removal |
| **Real-time Messaging** | ✅ | Instant delivery via native WebSockets (no polling) |
| **Typing Indicators** | ✅ | Live ephemeral typing status with auto-clear timeouts |
| **Message Reactions** | ✅ | Emoji quick-react on hover, reaction badge display |
| **Message Actions** | ✅ | Reply-to, copy text, delete — floating action pill on hover |
| **Conversation Search** | ✅ | Instant client-side search across contact names and previews |
| **Unread Badges** | ✅ | Per-conversation unread counts in the sidebar |
| **Cross-chat Toast Notifications** | ✅ | Toast for incoming messages when viewing another chat |
| **Group Info Panel** | ✅ | Slide-in panel with members list, roles, settings options |
| **Settings Panel** | ✅ | Profile, notifications, privacy, appearance, chat settings |
| **Light / Dark / System Theme** | ✅ | Full theme switching with CSS variable tokens, persisted via `localStorage` |
| **Responsive Layout** | ✅ | Single-pane mobile, two-pane desktop |
| **Calls View** | ⏳ | UI placeholder — call history & "New Call" screen ready |
| **Stories View** | ⏳ | Sidebar + viewer UI, create story modal — backend not wired |
| **Linked Devices** | ⏳ | UI placeholder screen |
| **End-to-end Encryption** | 🔒 | E2EE banner shown; Signal Protocol not yet implemented |

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** (App Router) — React 18, TypeScript
- **[Tailwind CSS](https://tailwindcss.com/)** — with a custom Signal design system (CSS variables for dynamic theming)
- **WebSocket API** — native browser WebSocket for real-time events
- **Context API** — `AuthContext` for global auth state

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** — async Python web framework
- **[SQLAlchemy 2.0](https://docs.sqlalchemy.org/)** (AsyncIO) + **aiosqlite** — async ORM with SQLite
- **[Alembic](https://alembic.sqlalchemy.org/)** — database migrations
- **[Pydantic v2](https://docs.pydantic.dev/)** — data validation and serialisation
- **JWT** (`python-jose`) — stateless authentication
- **bcrypt** (`passlib`) — password hashing

### Infrastructure
- **[Render](https://render.com/)** — cloud deployment (backend + static frontend)
- **SQLite** — embedded database (zero-config, file-based)

---

## 🗂 Project Structure

```
Signal/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/              # Route handlers (auth, users, conversations, messages, ws)
│   │   ├── core/             # Config, JWT utilities, security
│   │   ├── db/               # Database session and engine setup
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic layer
│   │   ├── ws/               # WebSocket connection manager & event handlers
│   │   ├── seed/             # Seed data scripts
│   │   └── main.py           # App entry point, CORS, router mounting
│   ├── alembic/              # Migration scripts
│   ├── requirements.txt
│   └── render-build.sh       # Render deployment build script
│
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── (auth)/           # Login & Register pages
│   │   └── (main)/           # Authenticated app shell
│   │       ├── chats/        # Chats list + [id] conversation view
│   │       ├── calls/        # Calls placeholder view
│   │       ├── stories/      # Stories sidebar + viewer
│   │       ├── settings/     # Settings & Appearance page
│   │       ├── linked-devices/ # Linked devices placeholder
│   │       └── layout.tsx    # Shell with MainNav + theme init
│   ├── components/
│   │   ├── chat/             # ChatHeader, Composer, MessageBubble, GroupInfoPanel
│   │   ├── contacts/         # ConversationListItem
│   │   └── ui/               # Avatar, Button, Input, Modal, Toast, MainNav
│   ├── context/              # AuthContext
│   ├── lib/                  # API client (api.ts), type definitions
│   ├── tailwind.config.ts    # Extended theme with semantic color tokens
│   └── app/globals.css       # CSS variable tokens for Light & Dark themes
│
├── docs/                     # Technical documentation
│   ├── schema.sql            # Full database schema
│   ├── api-contract.md       # REST API endpoint reference
│   ├── ws-contract.md        # WebSocket event protocol spec
│   └── design-tokens.md      # Design system tokens and guidelines
│
├── render.yaml               # Render deployment manifest
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.11+**

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/signal-clone.git
cd signal-clone
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

# (Optional) Seed demo data
python -m app.seed.seed_data

# Start the dev server
uvicorn app.main:app --reload --port 8000
```

- API base: `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (copy and edit as needed)
cp .env.example .env
```

`.env` contents:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

```bash
# Start the dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🎨 Theme System

The app implements a full Signal-faithful light/dark mode powered by CSS custom properties:

| Token | Light | Dark |
|---|---|---|
| `--bg-main` | `#FFFFFF` | `#121214` |
| `--bg-sidebar` | `#F4F4F6` | `#18181A` |
| `--bg-active` | `#E4E5E8` | `#323336` |
| `--bubble-received` | `#EAEBED` | `#28282B` |
| `--bubble-sent` | `#2C6BED` | `#2C6BED` |
| `--text-primary` | `#121214` | `#FFFFFF` |
| `--text-secondary` | `#5E6066` | `#9E9E9E` |

Theme preference is saved to `localStorage` and respects `prefers-color-scheme` when set to **System**.  
Switch via **Settings → Appearance → Theme**.

---

## 🌐 Deployment

The project is deployed on **[Render](https://render.com/)** using `render.yaml`:

- **Backend** → Render Web Service (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
- **Frontend** → Render Static Site (`npm run build`)

**Live URL**: [https://signal-clone-x1x8.onrender.com](https://signal-clone-x1x8.onrender.com)

> ⚠️ The backend is on Render's free tier and may take ~30s to cold-start after inactivity.

---

## 📖 Documentation

Full technical specs are in [`docs/`](docs/):

| Document | Description |
|---|---|
| [`schema.sql`](docs/schema.sql) | Full relational database schema |
| [`api-contract.md`](docs/api-contract.md) | REST API endpoints, request/response models, status codes |
| [`ws-contract.md`](docs/ws-contract.md) | WebSocket event protocol (`message:new`, `typing:update`, `presence:update`, …) |
| [`design-tokens.md`](docs/design-tokens.md) | Design tokens, color palette, typography, layout guidelines |

---

## 🧪 Testing

```bash
# Frontend — TypeScript type check
cd frontend && npx tsc --noEmit

# Frontend — production build check
cd frontend && npm run build

# Backend — run test suite
cd backend && pytest

# End-to-end group flow test (Node.js)
node test_e2e_groups.js
```

---

## 📄 License

This project is built for educational purposes as a UI/UX and full-stack engineering study. Signal® is a trademark of Signal Messenger LLC — this project is not affiliated with or endorsed by Signal.

---

<div align="center">
Made with ❤️ — a faithful Signal Desktop clone built from scratch.
</div>
