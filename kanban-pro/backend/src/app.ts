// Express application setup

import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';

import boardsRouter from './routes/boards';
import columnsRouter from './routes/columns';
import cardsRouter from './routes/cards';
import labelsRouter from './routes/labels';
import checklistRouter from './routes/checklist';
import habitsRouter from './routes/habits';
import scheduleRouter from './routes/schedule';
import studyRouter from './routes/study';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());

  // Request logging in development
  if (process.env.NODE_ENV === 'development') {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/boards', boardsRouter);
  app.use('/api/columns', columnsRouter);
  app.use('/api/cards', cardsRouter);
  app.use('/api/labels', labelsRouter);
  app.use('/api/checklist', checklistRouter);
  app.use('/api/habits', habitsRouter);
  app.use('/api/schedule', scheduleRouter);
  app.use('/api/study', studyRouter);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Error]', err);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  return app;
}
