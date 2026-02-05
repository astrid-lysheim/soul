// WebSocket broadcast helper
// Manages board subscriptions and broadcasts updates to subscribers

import type { WebSocket } from 'ws';
import type { WSMessage, WSMessageType } from '../../../shared/types';

// Map of boardId -> Set of WebSocket clients
const boardSubscriptions = new Map<string, Set<WebSocket>>();

// Map of WebSocket -> Set of boardIds (for cleanup)
const clientSubscriptions = new Map<WebSocket, Set<string>>();

export function subscribe(ws: WebSocket, boardId: string): void {
  // Add to board subscribers
  if (!boardSubscriptions.has(boardId)) {
    boardSubscriptions.set(boardId, new Set());
  }
  boardSubscriptions.get(boardId)!.add(ws);

  // Track client subscriptions for cleanup
  if (!clientSubscriptions.has(ws)) {
    clientSubscriptions.set(ws, new Set());
  }
  clientSubscriptions.get(ws)!.add(boardId);
}

export function unsubscribe(ws: WebSocket, boardId: string): void {
  // Remove from board subscribers
  const subscribers = boardSubscriptions.get(boardId);
  if (subscribers) {
    subscribers.delete(ws);
    if (subscribers.size === 0) {
      boardSubscriptions.delete(boardId);
    }
  }

  // Update client subscriptions
  const boards = clientSubscriptions.get(ws);
  if (boards) {
    boards.delete(boardId);
    if (boards.size === 0) {
      clientSubscriptions.delete(ws);
    }
  }
}

export function unsubscribeAll(ws: WebSocket): void {
  const boards = clientSubscriptions.get(ws);
  if (boards) {
    for (const boardId of boards) {
      const subscribers = boardSubscriptions.get(boardId);
      if (subscribers) {
        subscribers.delete(ws);
        if (subscribers.size === 0) {
          boardSubscriptions.delete(boardId);
        }
      }
    }
    clientSubscriptions.delete(ws);
  }
}

export function broadcast(
  boardId: string,
  type: WSMessageType,
  payload: unknown,
  excludeWs?: WebSocket
): void {
  const subscribers = boardSubscriptions.get(boardId);
  if (!subscribers) return;

  const message: WSMessage = { type, boardId, payload };
  const data = JSON.stringify(message);

  for (const ws of subscribers) {
    if (ws !== excludeWs && ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  }
}

export function getSubscriberCount(boardId: string): number {
  return boardSubscriptions.get(boardId)?.size ?? 0;
}

export function getBoardSubscriptions(): Map<string, Set<WebSocket>> {
  return boardSubscriptions;
}
