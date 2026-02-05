// Entry point for Kanban Pro backend

import { createServer } from 'http';
import { createApp } from './app';
import { createWebSocketServer } from './websocket';

const PORT = process.env.PORT || 3001;

async function main() {
  const app = createApp();
  const server = createServer(app);
  
  // Attach WebSocket server
  createWebSocketServer(server);
  
  server.listen(PORT, () => {
    console.log(`🚀 Kanban Pro backend running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server running on ws://localhost:${PORT}/ws`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
