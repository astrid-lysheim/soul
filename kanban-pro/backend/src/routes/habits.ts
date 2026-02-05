// Habit routes

import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/habits - Get all habits
router.get('/', async (_req: Request, res: Response) => {
  const habits = await prisma.habit.findMany({
    orderBy: { position: 'asc' },
  });
  
  // Parse days JSON
  const result = habits.map(h => ({
    ...h,
    days: JSON.parse(h.days),
  }));
  
  res.json(result);
});

// POST /api/habits - Create habit
router.post('/', async (req: Request, res: Response) => {
  const { icon, name, freq, days } = req.body;
  
  if (!name || !freq || !days) {
    res.status(400).json({ error: 'Name, freq, and days are required' });
    return;
  }
  
  // Get max position
  const maxPos = await prisma.habit.aggregate({
    _max: { position: true },
  });
  
  const habit = await prisma.habit.create({
    data: {
      icon: icon || '📌',
      name,
      freq,
      days: JSON.stringify(days),
      position: (maxPos._max.position ?? -1) + 1,
    },
  });
  
  res.status(201).json({
    ...habit,
    days: JSON.parse(habit.days),
  });
});

// PUT /api/habits/:id - Update habit
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { icon, name, freq, days } = req.body;
  
  const habit = await prisma.habit.update({
    where: { id },
    data: {
      ...(icon !== undefined && { icon }),
      ...(name !== undefined && { name }),
      ...(freq !== undefined && { freq }),
      ...(days !== undefined && { days: JSON.stringify(days) }),
    },
  });
  
  res.json({
    ...habit,
    days: JSON.parse(habit.days),
  });
});

// DELETE /api/habits/:id - Delete habit
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.habit.delete({ where: { id } });
  res.status(204).send();
});

// GET /api/habits/logs?start=YYYY-MM-DD&end=YYYY-MM-DD - Get logs for date range
router.get('/logs', async (req: Request, res: Response) => {
  const { start, end } = req.query;
  
  if (!start || !end) {
    res.status(400).json({ error: 'start and end dates required' });
    return;
  }
  
  const logs = await prisma.habitLog.findMany({
    where: {
      date: {
        gte: start as string,
        lte: end as string,
      },
    },
  });
  
  // Convert to { "2026-02-04": { "habitId": true } } format
  const result: Record<string, Record<string, boolean>> = {};
  for (const log of logs) {
    if (!result[log.date]) result[log.date] = {};
    result[log.date][log.habitId] = log.completed;
  }
  
  res.json(result);
});

// POST /api/habits/:id/log - Toggle habit completion for a date
router.post('/:id/log', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.body;
  
  if (!date) {
    res.status(400).json({ error: 'Date is required' });
    return;
  }
  
  // Check if log exists
  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId: id, date } },
  });
  
  if (existing) {
    // Toggle - delete if exists
    await prisma.habitLog.delete({
      where: { habitId_date: { habitId: id, date } },
    });
    res.json({ habitId: id, date, completed: false });
  } else {
    // Create new log
    const log = await prisma.habitLog.create({
      data: { habitId: id, date, completed: true },
    });
    res.json({ habitId: log.habitId, date: log.date, completed: true });
  }
});

export default router;
