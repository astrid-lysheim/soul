// WebSocket server for real-time updates

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { subscribe, unsubscribe, unsubscribeAll } from './lib/broadcast';

interface WSSubscribeMessage {
  type: 'subscribe';
  boardId: string;
}

interface WSUnsubscribeMessage {
  type: 'unsubscribe';
  boardId: string;
}

type ClientMessage = WSSubscribeMessage | WSUnsubscribeMessage;

function isValidMessage(data: unknown): data is ClientMessage {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as Record<string, unknown>;

  if (msg.type === 'subscribe' || msg.type === 'unsubscribe') {
    return typeof msg.boardId === 'string' && msg.boardId.length > 0;
  }
  return false;
}

export function createWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WS] Client connected');

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (!isValidMessage(message)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
          return;
        }

        switch (message.type) {
          case 'subscribe':
            subscribe(ws, message.boardId);
            ws.send(JSON.stringify({
              type: 'subscribed',
              boardId: message.boardId
            }));
            console.log(`[WS] Client subscribed to board: ${message.boardId}`);
            break;

          case 'unsubscribe':
            unsubscribe(ws, message.boardId);
            ws.send(JSON.stringify({
              type: 'unsubscribed',
              boardId: message.boardId
            }));
            console.log(`[WS] Client unsubscribed from board: ${message.boardId}`);
            break;
        }
      } catch (err) {
        console.error('[WS] Error parsing message:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      }
    });

    ws.on('close', () => {
      unsubscribeAll(ws);
      console.log('[WS] Client disconnected');
    });

    ws.on('error', (err) => {
      console.error('[WS] WebSocket error:', err);
      unsubscribeAll(ws);
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: 'connected' }));
  });

  wss.on('error', (err) => {
    console.error('[WS] Server error:', err);
  });

  console.log('[WS] WebSocket server initialized on /ws');
  return wss;
}
