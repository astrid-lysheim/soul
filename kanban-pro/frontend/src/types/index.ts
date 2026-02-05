// Frontend types for Kanban Pro

export interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  columns?: Column[];
  labels?: Label[];
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: number;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  cards?: Card[];
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  position: number;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  labels?: Label[];
  checklistItems?: ChecklistItem[];
}

export interface Label {
  id: string;
  boardId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  cardId: string;
  text: string;
  completed: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// WebSocket message types
export type WSMessageType =
  | 'connected'
  | 'subscribed'
  | 'unsubscribed'
  | 'error'
  | 'card:created'
  | 'card:updated'
  | 'card:deleted'
  | 'card:moved'
  | 'column:created'
  | 'column:updated'
  | 'column:deleted'
  | 'column:reordered'
  | 'label:created'
  | 'label:updated'
  | 'label:deleted';

export interface WSMessage {
  type: WSMessageType;
  boardId?: string;
  payload?: unknown;
}
