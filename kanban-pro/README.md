# Kanban Pro 📋

A production-grade kanban board with persistent storage. Built for José and Astrid.

## Features

- ✅ Drag-and-drop cards and columns
- ✅ Labels with colors
- ✅ Due dates with overdue indicators
- ✅ Markdown descriptions
- ✅ Checklists with progress tracking
- ✅ Search and filter
- ✅ Real-time sync via WebSockets
- ✅ PostgreSQL persistence

## Quick Start

```bash
# Start everything with Docker
docker-compose up -d

# Open the app
open http://localhost:5173
```

## Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm (recommended) or npm

### Setup

```bash
# Start the database
docker-compose up -d postgres

# Backend setup
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Import existing data

```bash
cd backend
npm run migrate:legacy
```

This imports cards from `../kanban/board.json`.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

```
Frontend (React + Vite)     → localhost:5173
Backend (Express + WS)      → localhost:3001
Database (PostgreSQL)       → localhost:5432
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, TypeScript, Tailwind, dnd-kit |
| Backend | Express, TypeScript, Prisma, WebSocket |
| Database | PostgreSQL 16 |
| DevOps | Docker Compose |

---

*Built with 💙 by Astrid, February 2026*
