// Checklist routes

import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { broadcast } from '../lib/broadcast';
import type { CreateChecklistItemRequest, UpdateChecklistItemRequest } from '../../../shared/types';

const router = Router();

// Helper to get boardId from card
async function getBoardIdFromCard(cardId: string): Promise<string | null> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { column: { select: { boardId: true } } },
  });
  return card?.column.boardId ?? null;
}

// GET /api/cards/:cardId/checklist - Get checklist items for a card
router.get('/cards/:cardId', async (req: Request, res: Response) => {
  const { cardId } = req.params;
  
  const items = await prisma.checklistItem.findMany({
    where: { cardId },
    orderBy: { position: 'asc' },
  });
  
  res.json(items);
});

// POST /api/cards/:cardId/checklist - Create checklist item
router.post('/cards/:cardId', async (req: Request, res: Response) => {
  const { cardId } = req.params;
  const { text } = req.body as CreateChecklistItemRequest;
  
  if (!text) {
    res.status(400).json({ error: 'Text is required' });
    return;
  }
  
  const boardId = await getBoardIdFromCard(cardId);
  if (!boardId) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  
  // Get max position
  const maxPos = await prisma.checklistItem.aggregate({
    where: { cardId },
    _max: { position: true },
  });
  
  const item = await prisma.checklistItem.create({
    data: {
      cardId,
      text,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });
  
  // Broadcast card update with full checklist
  await broadcastCardUpdate(cardId, boardId);
  res.status(201).json(item);
});

// PUT /api/checklist/:id - Update checklist item
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, completed } = req.body as UpdateChecklistItemRequest;
  
  const existing = await prisma.checklistItem.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Checklist item not found' });
    return;
  }
  
  const boardId = await getBoardIdFromCard(existing.cardId);
  if (!boardId) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  
  const item = await prisma.checklistItem.update({
    where: { id },
    data: {
      ...(text !== undefined && { text }),
      ...(completed !== undefined && { completed }),
    },
  });
  
  await broadcastCardUpdate(existing.cardId, boardId);
  res.json(item);
});

// DELETE /api/checklist/:id - Delete checklist item
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const item = await prisma.checklistItem.findUnique({ where: { id } });
  if (!item) {
    res.status(404).json({ error: 'Checklist item not found' });
    return;
  }
  
  const boardId = await getBoardIdFromCard(item.cardId);
  if (!boardId) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  
  // Delete and reorder remaining items
  await prisma.$transaction(async (tx) => {
    await tx.checklistItem.delete({ where: { id } });
    
    // Shift positions of items after the deleted one
    await tx.checklistItem.updateMany({
      where: {
        cardId: item.cardId,
        position: { gt: item.position },
      },
      data: { position: { decrement: 1 } },
    });
  });
  
  await broadcastCardUpdate(item.cardId, boardId);
  res.status(204).send();
});

// PUT /api/checklist/reorder - Reorder checklist items
router.put('/reorder', async (req: Request, res: Response) => {
  const { items } = req.body as { items: { id: string; position: number }[] };
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Items array is required' });
    return;
  }
  
  const firstItem = await prisma.checklistItem.findUnique({
    where: { id: items[0].id },
  });
  
  if (!firstItem) {
    res.status(404).json({ error: 'Checklist item not found' });
    return;
  }
  
  const boardId = await getBoardIdFromCard(firstItem.cardId);
  if (!boardId) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  
  // Update all positions in a transaction
  await prisma.$transaction(
    items.map(({ id, position }) =>
      prisma.checklistItem.update({
        where: { id },
        data: { position },
      })
    )
  );
  
  await broadcastCardUpdate(firstItem.cardId, boardId);
  res.json({ success: true });
});

// Helper to broadcast card update with full data
async function broadcastCardUpdate(cardId: string, boardId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      labels: { include: { label: true } },
      checklistItems: { orderBy: { position: 'asc' } },
    },
  });
  
  if (card) {
    const response = {
      ...card,
      labels: card.labels.map(cl => cl.label),
    };
    broadcast(boardId, 'card:updated', response);
  }
}

export default router;
