// Label routes

import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { broadcast } from '../lib/broadcast';
import type { CreateLabelRequest } from '../../../shared/types';

const router = Router();

// GET /api/boards/:boardId/labels - Get all labels for a board
router.get('/boards/:boardId', async (req: Request, res: Response) => {
  const { boardId } = req.params;
  
  const labels = await prisma.label.findMany({
    where: { boardId },
    orderBy: { createdAt: 'asc' },
  });
  
  res.json(labels);
});

// POST /api/boards/:boardId/labels - Create label
router.post('/boards/:boardId', async (req: Request, res: Response) => {
  const { boardId } = req.params;
  const { name, color } = req.body as CreateLabelRequest;
  
  if (!name || !color) {
    res.status(400).json({ error: 'Name and color are required' });
    return;
  }
  
  // Verify board exists
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    res.status(404).json({ error: 'Board not found' });
    return;
  }
  
  const label = await prisma.label.create({
    data: {
      boardId,
      name,
      color,
    },
  });
  
  broadcast(boardId, 'label:created', label);
  res.status(201).json(label);
});

// PUT /api/labels/:id - Update label
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, color } = req.body;
  
  const existing = await prisma.label.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Label not found' });
    return;
  }
  
  const label = await prisma.label.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
    },
  });
  
  broadcast(existing.boardId, 'label:updated', label);
  res.json(label);
});

// DELETE /api/labels/:id - Delete label
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const label = await prisma.label.findUnique({ where: { id } });
  if (!label) {
    res.status(404).json({ error: 'Label not found' });
    return;
  }
  
  // CardLabel entries will be cascade deleted due to schema
  await prisma.label.delete({ where: { id } });
  
  broadcast(label.boardId, 'label:deleted', { labelId: id });
  res.status(204).send();
});

export default router;
