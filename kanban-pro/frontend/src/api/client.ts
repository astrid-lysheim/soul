// API client for Kanban Pro

import type { Board, Column, Card, Label, ChecklistItem } from '../types';

const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// Board API
export const boardsApi = {
  list: () => request<Board[]>('/boards'),
  
  get: (id: string) => request<Board>(`/boards/${id}`),
  
  create: (name: string) =>
    request<Board>('/boards', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  
  update: (id: string, name: string) =>
    request<Board>(`/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),
  
  delete: (id: string) =>
    request<void>(`/boards/${id}`, { method: 'DELETE' }),
  
  search: (id: string, query: string) =>
    request<Card[]>(`/boards/${id}/search?q=${encodeURIComponent(query)}`),
};

// Column API
export const columnsApi = {
  create: (boardId: string, name: string, color?: string) =>
    request<Column>(`/columns/boards/${boardId}`, {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    }),
  
  update: (id: string, data: { name?: string; color?: string | null }) =>
    request<Column>(`/columns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    request<void>(`/columns/${id}`, { method: 'DELETE' }),
  
  reorder: (columns: { id: string; position: number }[]) =>
    request<void>('/columns/reorder', {
      method: 'PUT',
      body: JSON.stringify({ columns }),
    }),
};

// Card API
export const cardsApi = {
  create: (columnId: string, title: string, description?: string) =>
    request<Card>(`/cards/columns/${columnId}`, {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),
  
  get: (id: string) => request<Card>(`/cards/${id}`),
  
  update: (id: string, data: { title?: string; description?: string | null; dueDate?: string | null }) =>
    request<Card>(`/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    request<void>(`/cards/${id}`, { method: 'DELETE' }),
  
  move: (id: string, columnId: string, position: number) =>
    request<Card>(`/cards/${id}/move`, {
      method: 'PUT',
      body: JSON.stringify({ columnId, position }),
    }),
  
  addLabel: (cardId: string, labelId: string) =>
    request<void>(`/cards/${cardId}/labels/${labelId}`, { method: 'POST' }),
  
  removeLabel: (cardId: string, labelId: string) =>
    request<void>(`/cards/${cardId}/labels/${labelId}`, { method: 'DELETE' }),
};

// Label API
export const labelsApi = {
  list: (boardId: string) => request<Label[]>(`/labels/boards/${boardId}`),
  
  create: (boardId: string, name: string, color: string) =>
    request<Label>(`/labels/boards/${boardId}`, {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    }),
  
  update: (id: string, data: { name?: string; color?: string }) =>
    request<Label>(`/labels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    request<void>(`/labels/${id}`, { method: 'DELETE' }),
};

// Checklist API
export const checklistApi = {
  create: (cardId: string, text: string) =>
    request<ChecklistItem>(`/checklist/cards/${cardId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  
  update: (id: string, data: { text?: string; completed?: boolean }) =>
    request<ChecklistItem>(`/checklist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    request<void>(`/checklist/${id}`, { method: 'DELETE' }),
};

// Habit types
export interface Habit {
  id: string;
  icon: string;
  name: string;
  freq: string;
  days: number[];
  position: number;
}

export interface HabitLog {
  [date: string]: { [habitId: string]: boolean };
}

// Habits API
export const habitsApi = {
  list: () => request<Habit[]>('/habits'),
  
  create: (data: { icon: string; name: string; freq: string; days: number[] }) =>
    request<Habit>('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<{ icon: string; name: string; freq: string; days: number[] }>) =>
    request<Habit>(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    request<void>(`/habits/${id}`, { method: 'DELETE' }),
  
  getLogs: (start: string, end: string) =>
    request<HabitLog>(`/habits/logs?start=${start}&end=${end}`),
  
  toggleLog: (habitId: string, date: string) =>
    request<{ habitId: string; date: string; completed: boolean }>(`/habits/${habitId}/log`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    }),
};

// Schedule types
export interface ScheduleBlock {
  id: string;
  title: string;
  day: number;
  startTime: string;
  duration: number;
  color: string;
  repeat: string;
}

// Schedule API
export const scheduleApi = {
  list: () => request<ScheduleBlock[]>('/schedule'),
  
  create: (data: Omit<ScheduleBlock, 'id'>) =>
    request<ScheduleBlock>('/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<ScheduleBlock>) =>
    request<ScheduleBlock>(`/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    request<void>(`/schedule/${id}`, { method: 'DELETE' }),
};

// Study types
export interface StudyTopic {
  id: string;
  weekId: string;
  text: string;
  examTag: boolean;
  completed: boolean;
  position: number;
}

export interface StudyWeek {
  id: string;
  phaseId: string;
  title: string;
  source: string | null;
  position: number;
  topics: StudyTopic[];
}

export interface StudyPhase {
  id: string;
  icon: string;
  name: string;
  description: string | null;
  position: number;
  weeks: StudyWeek[];
}

export interface StudyStats {
  total: number;
  completed: number;
  percent: number;
}

// Study API
export const studyApi = {
  list: () => request<StudyPhase[]>('/study'),
  
  getStats: () => request<StudyStats>('/study/stats'),
  
  toggleTopic: (topicId: string) =>
    request<StudyTopic>(`/study/topics/${topicId}/toggle`, { method: 'POST' }),
  
  updateTopic: (topicId: string, data: Partial<StudyTopic>) =>
    request<StudyTopic>(`/study/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
