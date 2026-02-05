// Schedule routes

import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/schedule - Get all schedule blocks
router.get('/', async (_req: Request, res: Response) => {
  const blocks = await prisma.scheduleBlock.findMany({
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  });
  res.json(blocks);
});

// POST /api/schedule - Create schedule block
router.post('/', async (req: Request, res: Response) => {
  const { title, day, startTime, duration, color, repeat } = req.body;
  
  if (!title || day === undefined || !startTime || !duration) {
    res.status(400).json({ error: 'title, day, startTime, and duration are required' });
    return;
  }
  
  const block = await prisma.scheduleBlock.create({
    data: {
      title,
      day,
      startTime,
      duration,
      color: color || 'blue',
      repeat: repeat || 'none',
    },
  });
  
  res.status(201).json(block);
});

// PUT /api/schedule/:id - Update schedule block
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, day, startTime, duration, color, repeat } = req.body;
  
  const block = await prisma.scheduleBlock.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(day !== undefined && { day }),
      ...(startTime !== undefined && { startTime }),
      ...(duration !== undefined && { duration }),
      ...(color !== undefined && { color }),
      ...(repeat !== undefined && { repeat }),
    },
  });
  
  res.json(block);
});

// DELETE /api/schedule/:id - Delete schedule block
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.scheduleBlock.delete({ where: { id } });
  res.status(204).send();
});

export default router;
