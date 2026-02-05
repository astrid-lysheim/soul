# Kanban Pro — Architecture Document

*A production-grade kanban board with persistent storage*

## Overview

Local-only kanban application for José and Astrid. No auth, no deployment complexity — just solid engineering.

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | React 18 + TypeScript | Type safety, component model |
| Build | Vite | Fast HMR, modern bundling |
| Styling | Tailwind CSS | Rapid UI development |
| Drag & Drop | @dnd-kit | Modern, accessible, performant |
| Backend | Express + TypeScript | Simple, well-understood |
| Real-time | WebSocket (ws) | Live sync between clients |
| Database | PostgreSQL 16 | Reliable, relational, battle-tested |
| ORM | Prisma | Type-safe queries, easy migrations |
| Container | Docker Compose | One command to run everything |

## Data Model

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Board     │──────<│   Column    │──────<│    Card     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ name        │       │ boardId     │       │ columnId    │
│ createdAt   │       │ name        │       │ title       │
│ updatedAt   │       │ position    │       │ description │
└─────────────┘       │ color       │       │ position    │
                      │ createdAt   │       │ dueDate     │
                      │ updatedAt   │       │ createdAt   │
                      └─────────────┘       │ updatedAt   │
                                            └──────┬──────┘
                                                   │
                      ┌────────────────────────────┼────────────────────────────┐
                      │                            │                            │
                      ▼                            ▼                            ▼
              ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
              │   Label     │              │ CardLabel   │              │ChecklistItem│
              ├─────────────┤              ├─────────────┤              ├─────────────┤
              │ id          │<─────────────│ labelId     │              │ id          │
              │ boardId     │              │ cardId      │              │ cardId      │
              │ name        │              └─────────────┘              │ text        │
              │ color       │                                          │ completed   │
              │ createdAt   │                                          │ position    │
              └─────────────┘                                          │ createdAt   │
                                                                       │ updatedAt   │
                                                                       └─────────────┘
```

## API Design (REST + WebSocket)

### REST Endpoints

```
# Boards
GET    /api/boards              List all boards
POST   /api/boards              Create board
GET    /api/boards/:id          Get board with columns, cards, labels
PUT    /api/boards/:id          Update board
DELETE /api/boards/:id          Delete board

# Columns
POST   /api/boards/:id/columns          Create column
PUT    /api/columns/:id                 Update column
DELETE /api/columns/:id                 Delete column
PUT    /api/columns/reorder             Reorder columns

# Cards
POST   /api/columns/:id/cards           Create card
GET    /api/cards/:id                   Get card with checklists, labels
PUT    /api/cards/:id                   Update card
DELETE /api/cards/:id                   Delete card
PUT    /api/cards/:id/move              Move card to column/position

# Labels
GET    /api/boards/:id/labels           List board labels
POST   /api/boards/:id/labels           Create label
PUT    /api/labels/:id                  Update label
DELETE /api/labels/:id                  Delete label
POST   /api/cards/:id/labels/:labelId   Add label to card
DELETE /api/cards/:id/labels/:labelId   Remove label from card

# Checklists
POST   /api/cards/:id/checklist         Add checklist item
PUT    /api/checklist/:id               Update checklist item
DELETE /api/checklist/:id               Delete checklist item

# Search
GET    /api/boards/:id/search?q=...     Search cards
```

### WebSocket Events

```typescript
// Client → Server
{ type: "subscribe", boardId: string }
{ type: "unsubscribe", boardId: string }

// Server → Client (broadcast to board subscribers)
{ type: "card:created", card: Card }
{ type: "card:updated", card: Card }
{ type: "card:deleted", cardId: string }
{ type: "card:moved", cardId: string, columnId: string, position: number }
{ type: "column:created", column: Column }
{ type: "column:updated", column: Column }
{ type: "column:deleted", columnId: string }
{ type: "column:reordered", columns: { id: string, position: number }[] }
```

## Project Structure

```
kanban-pro/
├── docker-compose.yml
├── README.md
├── ARCHITECTURE.md
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── index.ts              # Entry point
│       ├── app.ts                # Express app setup
│       ├── websocket.ts          # WebSocket server
│       ├── routes/
│       │   ├── boards.ts
│       │   ├── columns.ts
│       │   ├── cards.ts
│       │   └── labels.ts
│       └── lib/
│           ├── prisma.ts         # Prisma client
│           └── broadcast.ts      # WS broadcast helper
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   └── client.ts         # API client
│       ├── hooks/
│       │   ├── useBoard.ts
│       │   ├── useWebSocket.ts
│       │   └── useDragDrop.ts
│       ├── components/
│       │   ├── Board.tsx
│       │   ├── Column.tsx
│       │   ├── Card.tsx
│       │   ├── CardModal.tsx
│       │   ├── Checklist.tsx
│       │   ├── Labels.tsx
│       │   └── SearchBar.tsx
│       └── types/
│           └── index.ts
│
└── shared/
    └── types.ts                  # Shared TypeScript types
```

## Features Breakdown

### 1. Drag & Drop
- Drag cards between columns
- Reorder cards within columns
- Reorder columns
- Visual feedback during drag

### 2. Labels
- Board-level label definitions (name + color)
- Assign multiple labels per card
- Filter cards by label
- Predefined color palette

### 3. Due Dates
- Optional due date per card
- Visual indicator (color) for overdue/upcoming
- Sort/filter by due date

### 4. Card Descriptions
- Markdown support
- Preview and edit modes

### 5. Checklists
- Multiple items per card
- Check/uncheck items
- Progress indicator (3/5 done)
- Reorder items

### 6. Search & Filter
- Full-text search on title + description
- Filter by label
- Filter by due date (overdue, this week, no date)
- Filter by column

## Migration Plan

Import existing cards from `kanban/board.json`:

1. Parse existing JSON structure
2. Create default board
3. Map existing columns
4. Import cards with positions
5. Verify data integrity

## Running Locally

```bash
# Start everything
docker-compose up -d

# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
# Postgres: localhost:5432
```

## Development Workflow

```bash
# Backend development
cd backend && npm run dev

# Frontend development  
cd frontend && npm run dev

# Database migrations
cd backend && npx prisma migrate dev

# Reset database
cd backend && npx prisma migrate reset
```

---

*Designed by Astrid, February 2026* 🏔️
