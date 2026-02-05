// Board routes

import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import type { CreateBoardRequest } from '../../../shared/types';

const router = Router();

// GET /api/boards - List all boards
router.get('/', async (_req: Request, res: Response) => {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(boards);
});

// POST /api/boards - Create a new board
router.post('/', async (req: Request, res: Response) => {
  const { name } = req.body as CreateBoardRequest;
  
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  
  const board = await prisma.board.create({
    data: { name },
  });
  res.status(201).json(board);
});

// GET /api/boards/:id - Get board with all data
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          cards: {
            orderBy: { position: 'asc' },
            include: {
              labels: {
                include: { label: true },
              },
              checklistItems: {
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      },
      labels: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }
  
  // Transform labels on cards
  const transformedBoard = {
    ...board,
    columns: board.columns.map(col => ({
      ...col,
      cards: col.cards.map(card => ({
        ...card,
        labels: card.labels.map(cl => cl.label),
      })),
    })),
  };
  
  res.json(transformedBoard);
});

// PUT /api/boards/:id - Update board
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  
  const board = await prisma.board.update({
    where: { id },
    data: { name },
  });
  res.json(board);
});

// DELETE /api/boards/:id - Delete board
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  await prisma.board.delete({
    where: { id },
  });
  res.status(204).send();
});

// GET /api/boards/:id/search - Search cards in board
router.get('/:id/search', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { q, labelIds, dueDateFilter } = req.query;
  
  const where: any = {
    column: { boardId: id },
  };
  
  if (q && typeof q === 'string') {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  
  if (labelIds && typeof labelIds === 'string') {
    const ids = labelIds.split(',');
    where.labels = {
      some: { labelId: { in: ids } },
    };
  }
  
  if (dueDateFilter) {
    const now = new Date();
    switch (dueDateFilter) {
      case 'overdue':
        where.dueDate = { lt: now };
        break;
      case 'today':
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        where.dueDate = { gte: now, lte: todayEnd };
        break;
      case 'this_week':
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() + 7);
        where.dueDate = { gte: now, lte: weekEnd };
        break;
      case 'no_date':
        where.dueDate = null;
        break;
    }
  }
  
  const cards = await prisma.card.findMany({
    where,
    include: {
      labels: { include: { label: true } },
      column: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
  
  res.json(cards.map(card => ({
    ...card,
    labels: card.labels.map(cl => cl.label),
  })));
});

export default router;
