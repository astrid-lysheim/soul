// Column routes

import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import { broadcast } from '../lib/broadcast';
import type { CreateColumnRequest, ReorderColumnsRequest } from '../../../shared/types';

const router = Router();

// POST /api/boards/:boardId/columns - Create column (mounted at /api/columns but called with boardId)
router.post('/boards/:boardId', async (req: Request, res: Response) => {
  const { boardId } = req.params;
  const { name, color } = req.body as CreateColumnRequest;
  
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  
  // Get max position
  const maxPos = await prisma.column.aggregate({
    where: { boardId },
    _max: { position: true },
  });
  
  const column = await prisma.column.create({
    data: {
      boardId,
      name,
      color: color || null,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });
  
  broadcast(boardId, 'column:created', column);
  res.status(201).json(column);
});

// PUT /api/columns/:id - Update column
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, color } = req.body;
  
  const column = await prisma.column.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
    },
  });
  
  broadcast(column.boardId, 'column:updated', column);
  res.json(column);
});

// DELETE /api/columns/:id - Delete column
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const column = await prisma.column.findUnique({ where: { id } });
  if (!column) {
    res.status(404).json({ error: 'Column not found' });
    return;
  }
  
  await prisma.column.delete({ where: { id } });
  
  broadcast(column.boardId, 'column:deleted', { columnId: id });
  res.status(204).send();
});

// PUT /api/columns/reorder - Reorder columns
router.put('/reorder', async (req: Request, res: Response) => {
  const { columns } = req.body as ReorderColumnsRequest;
  
  if (!columns || !Array.isArray(columns)) {
    res.status(400).json({ error: 'Columns array is required' });
    return;
  }
  
  // Get board ID from first column
  const firstColumn = await prisma.column.findUnique({
    where: { id: columns[0].id },
  });
  
  if (!firstColumn) {
    res.status(404).json({ error: 'Column not found' });
    return;
  }
  
  // Update all positions in a transaction
  await prisma.$transaction(
    columns.map(({ id, position }) =>
      prisma.column.update({
        where: { id },
        data: { position },
      })
    )
  );
  
  broadcast(firstColumn.boardId, 'column:reordered', { columns });
  res.json({ success: true });
});

export default router;
