// Card routes

import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { broadcast } from '../lib/broadcast';
import type { CreateCardRequest, UpdateCardRequest, MoveCardRequest } from '../../../shared/types';

const router = Router();

// GET /api/cards/:id - Get single card with details
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const card = await prisma.card.findUnique({
    where: { id },
    include: {
      labels: { include: { label: true } },
      checklistItems: { orderBy: { position: 'asc' } },
      column: { select: { boardId: true } },
    },
  });
  
  if (!card) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  
  // Flatten labels
  const response = {
    ...card,
    labels: card.labels.map(cl => cl.label),
  };
  
  res.json(response);
});

// POST /api/columns/:columnId/cards - Create card in column
router.post('/columns/:columnId', async (req: Request, res: Response) => {
  const { columnId } = req.params;
  const { title, description, dueDate } = req.body as CreateCardRequest;
  
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }
  
  // Get column and board info
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });
  
  if (!column) {
    res.status(404).json({ error: 'Column not found' });
    return;
  }
  
  // Get max position in column
  const maxPos = await prisma.card.aggregate({
    where: { columnId },
    _max: { position: true },
  });
  
  const card = await prisma.card.create({
    data: {
      columnId,
      title,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      position: (maxPos._max.position ?? -1) + 1,
    },
    include: {
      labels: { include: { label: true } },
      checklistItems: { orderBy: { position: 'asc' } },
    },
  });
  
  const response = {
    ...card,
    labels: card.labels.map(cl => cl.label),
  };
  
  broadcast(column.boardId, 'card:created', response);
  res.status(201).json(response);
});

// PUT /api/cards/:id - Update card
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, dueDate } = req.body as UpdateCardRequest;
  
  const existing = await prisma.card.findUnique({
    where: { id },
    include: { column: { select: { boardId: true } } },
  });
  
  if (!existing) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  
  const card = await prisma.card.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: {
      labels: { include: { label: true } },
      checklistItems: { orderBy: { position: 'asc' } },
    },
  });
  
  const response = {
    ...card,
    labels: card.labels.map(cl => cl.label),
  };
  
  broadcast(existing.column.boardId, 'card:updated', response);
  res.json(response);
});

// DELETE /api/cards/:id - Delete card
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const card = await prisma.card.findUnique({
    where: { id },
    include: { column: { select: { boardId: true } } },
  });
  
  if (!card) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  
  await prisma.card.delete({ where: { id } });
  
  broadcast(card.column.boardId, 'card:deleted', { cardId: id, columnId: card.columnId });
  res.status(204).send();
});

// PUT /api/cards/:id/move - Move card to different column/position
router.put('/:id/move', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { columnId, position } = req.body as MoveCardRequest;
  
  if (!columnId || position === undefined) {
    res.status(400).json({ error: 'columnId and position are required' });
    return;
  }
  
  const card = await prisma.card.findUnique({
    where: { id },
    include: { column: { select: { boardId: true } } },
  });
  
  if (!card) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  
  const oldColumnId = card.columnId;
  const boardId = card.column.boardId;
  
  // Use transaction to update positions atomically
  await prisma.$transaction(async (tx) => {
    // If moving within same column
    if (oldColumnId === columnId) {
      const oldPos = card.position;
      if (position > oldPos) {
        // Moving down: shift cards between old and new position up
        await tx.card.updateMany({
          where: {
            columnId,
            position: { gt: oldPos, lte: position },
          },
          data: { position: { decrement: 1 } },
        });
      } else if (position < oldPos) {
        // Moving up: shift cards between new and old position down
        await tx.card.updateMany({
          where: {
            columnId,
            position: { gte: position, lt: oldPos },
          },
          data: { position: { increment: 1 } },
        });
      }
    } else {
      // Moving to different column
      // Shift cards in old column up
      await tx.card.updateMany({
        where: {
          columnId: oldColumnId,
          position: { gt: card.position },
        },
        data: { position: { decrement: 1 } },
      });
      
      // Shift cards in new column down
      await tx.card.updateMany({
        where: {
          columnId,
          position: { gte: position },
        },
        data: { position: { increment: 1 } },
      });
    }
    
    // Update the card
    await tx.card.update({
      where: { id },
      data: { columnId, position },
    });
  });
  
  broadcast(boardId, 'card:moved', { cardId: id, columnId, position, oldColumnId });
  res.json({ success: true });
});

// POST /api/cards/:id/labels/:labelId - Add label to card
router.post('/:id/labels/:labelId', async (req: Request, res: Response) => {
  const { id, labelId } = req.params;
  
  const card = await prisma.card.findUnique({
    where: { id },
    include: { column: { select: { boardId: true } } },
  });
  
  if (!card) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  
  // Check if already attached
  const existing = await prisma.cardLabel.findUnique({
    where: { cardId_labelId: { cardId: id, labelId } },
  });
  
  if (!existing) {
    await prisma.cardLabel.create({
      data: { cardId: id, labelId },
    });
  }
  
  // Fetch updated card
  const updated = await prisma.card.findUnique({
    where: { id },
    include: {
      labels: { include: { label: true } },
      checklistItems: { orderBy: { position: 'asc' } },
    },
  });
  
  const response = {
    ...updated,
    labels: updated!.labels.map(cl => cl.label),
  };
  
  broadcast(card.column.boardId, 'card:updated', response);
  res.json(response);
});

// DELETE /api/cards/:id/labels/:labelId - Remove label from card
router.delete('/:id/labels/:labelId', async (req: Request, res: Response) => {
  const { id, labelId } = req.params;
  
  const card = await prisma.card.findUnique({
    where: { id },
    include: { column: { select: { boardId: true } } },
  });
  
  if (!card) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  
  await prisma.cardLabel.deleteMany({
    where: { cardId: id, labelId },
  });
  
  // Fetch updated card
  const updated = await prisma.card.findUnique({
    where: { id },
    include: {
      labels: { include: { label: true } },
      checklistItems: { orderBy: { position: 'asc' } },
    },
  });
  
  const response = {
    ...updated,
    labels: updated!.labels.map(cl => cl.label),
  };
  
  broadcast(card.column.boardId, 'card:updated', response);
  res.json(response);
});

export default router;
