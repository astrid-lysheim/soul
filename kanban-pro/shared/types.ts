// Shared types for Kanban Pro
// Used by both frontend and backend

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

// API Request/Response types

export interface CreateBoardRequest {
  name: string;
}

export interface CreateColumnRequest {
  name: string;
  color?: string;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  dueDate?: string | null;
}

export interface MoveCardRequest {
  columnId: string;
  position: number;
}

export interface ReorderColumnsRequest {
  columns: { id: string; position: number }[];
}

export interface CreateLabelRequest {
  name: string;
  color: string;
}

export interface CreateChecklistItemRequest {
  text: string;
}

export interface UpdateChecklistItemRequest {
  text?: string;
  completed?: boolean;
}

// WebSocket message types

export type WSMessageType =
  | 'subscribe'
  | 'unsubscribe'
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

export interface WSCardMovedPayload {
  cardId: string;
  columnId: string;
  position: number;
}

export interface WSColumnReorderedPayload {
  columns: { id: string; position: number }[];
}

// Search types

export interface SearchFilters {
  query?: string;
  labelIds?: string[];
  dueDateFilter?: 'overdue' | 'today' | 'this_week' | 'no_date' | null;
  columnIds?: string[];
}

// Default label colors
export const LABEL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
] as const;

// Default column colors
export const COLUMN_COLORS = [
  '#fee2e2', // red-100
  '#fef3c7', // amber-100
  '#d1fae5', // emerald-100
  '#dbeafe', // blue-100
  '#f3e8ff', // purple-100
  '#fce7f3', // pink-100
  '#f3f4f6', // gray-100
] as const;
