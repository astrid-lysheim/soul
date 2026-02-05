// Study plan routes

import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/study - Get full study plan (phases with weeks and topics)
router.get('/', async (_req: Request, res: Response) => {
  const phases = await prisma.studyPhase.findMany({
    orderBy: { position: 'asc' },
    include: {
      weeks: {
        orderBy: { position: 'asc' },
        include: {
          topics: {
            orderBy: { position: 'asc' },
          },
        },
      },
    },
  });
  
  res.json(phases);
});

// POST /api/study/phases - Create phase
router.post('/phases', async (req: Request, res: Response) => {
  const { icon, name, description } = req.body;
  
  if (!icon || !name) {
    res.status(400).json({ error: 'icon and name are required' });
    return;
  }
  
  const maxPos = await prisma.studyPhase.aggregate({
    _max: { position: true },
  });
  
  const phase = await prisma.studyPhase.create({
    data: {
      icon,
      name,
      description: description || null,
      position: (maxPos._max.position ?? -1) + 1,
    },
    include: { weeks: { include: { topics: true } } },
  });
  
  res.status(201).json(phase);
});

// PUT /api/study/phases/:id - Update phase
router.put('/phases/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { icon, name, description } = req.body;
  
  const phase = await prisma.studyPhase.update({
    where: { id },
    data: {
      ...(icon !== undefined && { icon }),
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    },
    include: { weeks: { include: { topics: true } } },
  });
  
  res.json(phase);
});

// DELETE /api/study/phases/:id - Delete phase
router.delete('/phases/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.studyPhase.delete({ where: { id } });
  res.status(204).send();
});

// POST /api/study/phases/:phaseId/weeks - Create week
router.post('/phases/:phaseId/weeks', async (req: Request, res: Response) => {
  const { phaseId } = req.params;
  const { title, source } = req.body;
  
  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  
  const maxPos = await prisma.studyWeek.aggregate({
    where: { phaseId },
    _max: { position: true },
  });
  
  const week = await prisma.studyWeek.create({
    data: {
      phaseId,
      title,
      source: source || null,
      position: (maxPos._max.position ?? -1) + 1,
    },
    include: { topics: true },
  });
  
  res.status(201).json(week);
});

// PUT /api/study/weeks/:id - Update week
router.put('/weeks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, source } = req.body;
  
  const week = await prisma.studyWeek.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(source !== undefined && { source }),
    },
    include: { topics: true },
  });
  
  res.json(week);
});

// DELETE /api/study/weeks/:id - Delete week
router.delete('/weeks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.studyWeek.delete({ where: { id } });
  res.status(204).send();
});

// POST /api/study/weeks/:weekId/topics - Create topic
router.post('/weeks/:weekId/topics', async (req: Request, res: Response) => {
  const { weekId } = req.params;
  const { text, examTag } = req.body;
  
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }
  
  const maxPos = await prisma.studyTopic.aggregate({
    where: { weekId },
    _max: { position: true },
  });
  
  const topic = await prisma.studyTopic.create({
    data: {
      weekId,
      text,
      examTag: examTag || false,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });
  
  res.status(201).json(topic);
});

// PUT /api/study/topics/:id - Update topic (including toggle completed)
router.put('/topics/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, examTag, completed } = req.body;
  
  const topic = await prisma.studyTopic.update({
    where: { id },
    data: {
      ...(text !== undefined && { text }),
      ...(examTag !== undefined && { examTag }),
      ...(completed !== undefined && { completed }),
    },
  });
  
  res.json(topic);
});

// POST /api/study/topics/:id/toggle - Quick toggle completed
router.post('/topics/:id/toggle', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const existing = await prisma.studyTopic.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Topic not found' });
    return;
  }
  
  const topic = await prisma.studyTopic.update({
    where: { id },
    data: { completed: !existing.completed },
  });
  
  res.json(topic);
});

// DELETE /api/study/topics/:id - Delete topic
router.delete('/topics/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.studyTopic.delete({ where: { id } });
  res.status(204).send();
});

// GET /api/study/stats - Get overall progress stats
router.get('/stats', async (_req: Request, res: Response) => {
  const allTopics = await prisma.studyTopic.findMany();
  const total = allTopics.length;
  const completed = allTopics.filter(t => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  res.json({ total, completed, percent });
});

export default router;
