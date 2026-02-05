/**
 * Seed script: Import default habits, schedule, and study plan
 * 
 * Run with: npm run seed:extras
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default habits from original app
const DEFAULT_HABITS = [
  { icon: '🧘', name: 'Meditation (15 min)', freq: 'daily', days: [0,1,2,3,4,5,6] },
  { icon: '📖', name: 'Scripture reading', freq: 'daily', days: [0,1,2,3,4,5,6] },
  { icon: '🇳🇴', name: 'Norwegian lesson (15 min)', freq: 'daily', days: [0,1,2,3,4,5,6] },
  { icon: '📚', name: 'Study block', freq: 'daily', days: [0,1,2,3,4,5,6] },
  { icon: '💼', name: 'Kyndryl focus', freq: 'weekdays', days: [0,1,2,3,4] },
  { icon: '🏋️', name: 'Gym', freq: 'custom', days: [0,1,3,4] },
  { icon: '🧘‍♂️', name: 'Yoga/Mobility', freq: 'custom', days: [2,5] },
  { icon: '🍽️', name: 'Eat real food (2 PM)', freq: 'daily', days: [0,1,2,3,4,5,6] },
  { icon: '💊', name: 'Meds on time (8:45 PM)', freq: 'daily', days: [0,1,2,3,4,5,6] },
  { icon: '🛏️', name: 'Sleep by 9:30 PM', freq: 'daily', days: [0,1,2,3,4,5,6] },
  { icon: '🧍', name: 'Posture breaks (4x during work)', freq: 'weekdays', days: [0,1,2,3,4] },
];

// Default schedule blocks
const DEFAULT_SCHEDULE = [
  { title: 'Morning Routine', day: 0, startTime: '06:30', duration: 1.5, color: 'teal', repeat: 'weekly' },
  { title: 'Morning Routine', day: 1, startTime: '06:30', duration: 1.5, color: 'teal', repeat: 'weekly' },
  { title: 'Morning Routine', day: 2, startTime: '06:30', duration: 1.5, color: 'teal', repeat: 'weekly' },
  { title: 'Morning Routine', day: 3, startTime: '06:30', duration: 1.5, color: 'teal', repeat: 'weekly' },
  { title: 'Morning Routine', day: 4, startTime: '06:30', duration: 1.5, color: 'teal', repeat: 'weekly' },
  { title: 'Study Block', day: 0, startTime: '08:00', duration: 2, color: 'purple', repeat: 'weekly' },
  { title: 'Study Block', day: 1, startTime: '08:00', duration: 2, color: 'purple', repeat: 'weekly' },
  { title: 'Study Block', day: 2, startTime: '08:00', duration: 2, color: 'purple', repeat: 'weekly' },
  { title: 'Study Block', day: 3, startTime: '08:00', duration: 2, color: 'purple', repeat: 'weekly' },
  { title: 'Study Block', day: 4, startTime: '08:00', duration: 2, color: 'purple', repeat: 'weekly' },
  { title: 'Kyndryl', day: 0, startTime: '10:00', duration: 8, color: 'blue', repeat: 'weekly' },
  { title: 'Kyndryl', day: 1, startTime: '10:00', duration: 8, color: 'blue', repeat: 'weekly' },
  { title: 'Kyndryl', day: 2, startTime: '10:00', duration: 8, color: 'blue', repeat: 'weekly' },
  { title: 'Kyndryl', day: 3, startTime: '10:00', duration: 8, color: 'blue', repeat: 'weekly' },
  { title: 'Kyndryl', day: 4, startTime: '10:00', duration: 8, color: 'blue', repeat: 'weekly' },
  { title: 'Lunch', day: 0, startTime: '14:00', duration: 1, color: 'orange', repeat: 'weekly' },
  { title: 'Lunch', day: 1, startTime: '14:00', duration: 1, color: 'orange', repeat: 'weekly' },
  { title: 'Lunch', day: 2, startTime: '14:00', duration: 1, color: 'orange', repeat: 'weekly' },
  { title: 'Lunch', day: 3, startTime: '14:00', duration: 1, color: 'orange', repeat: 'weekly' },
  { title: 'Lunch', day: 4, startTime: '14:00', duration: 1, color: 'orange', repeat: 'weekly' },
  { title: 'Gym', day: 0, startTime: '19:00', duration: 1.5, color: 'green', repeat: 'weekly' },
  { title: 'Gym', day: 1, startTime: '19:00', duration: 1.5, color: 'green', repeat: 'weekly' },
  { title: 'Yoga', day: 2, startTime: '19:00', duration: 1, color: 'pink', repeat: 'weekly' },
  { title: 'Gym', day: 3, startTime: '19:00', duration: 1.5, color: 'green', repeat: 'weekly' },
  { title: 'Gym', day: 4, startTime: '19:00', duration: 1.5, color: 'green', repeat: 'weekly' },
  { title: 'Yoga', day: 5, startTime: '10:00', duration: 1, color: 'pink', repeat: 'weekly' },
  { title: 'Wind Down', day: 0, startTime: '20:30', duration: 1, color: 'indigo', repeat: 'weekly' },
  { title: 'Wind Down', day: 1, startTime: '20:30', duration: 1, color: 'indigo', repeat: 'weekly' },
  { title: 'Wind Down', day: 2, startTime: '20:30', duration: 1, color: 'indigo', repeat: 'weekly' },
  { title: 'Wind Down', day: 3, startTime: '20:30', duration: 1, color: 'indigo', repeat: 'weekly' },
  { title: 'Wind Down', day: 4, startTime: '20:30', duration: 1, color: 'indigo', repeat: 'weekly' },
];

// DiffEq Study Plan
const STUDY_PLAN = [
  {
    icon: '🧱',
    name: 'Phase 0: Foundation',
    description: 'Algebra, functions, limits, and basic derivatives/integrals',
    weeks: [
      {
        title: 'Week 1-2: Algebra & Pre-Calc',
        source: 'Khan Academy / Paul\'s Notes',
        topics: [
          'Factoring & polynomial division',
          'Exponential & logarithmic functions',
          'Trigonometric identities',
          'Function composition & inverses',
        ],
      },
      {
        title: 'Week 3-4: Calculus I Review',
        source: 'Stewart Calculus / MIT OCW',
        topics: [
          'Limits and continuity',
          'Derivative rules (product, quotient, chain)',
          'Basic integration techniques',
          'Fundamental theorem of calculus',
        ],
      },
    ],
  },
  {
    icon: '📐',
    name: 'Phase 1: First-Order ODEs',
    description: 'Separable, linear, and exact equations',
    weeks: [
      {
        title: 'Week 5-6: Separable & Linear',
        source: 'Boyce & DiPrima Ch. 2',
        topics: [
          { text: 'Separable equations', examTag: true },
          { text: 'First-order linear equations', examTag: true },
          'Integrating factors',
          'Existence and uniqueness theorems',
        ],
      },
      {
        title: 'Week 7-8: Exact & Substitution',
        source: 'Boyce & DiPrima Ch. 2',
        topics: [
          { text: 'Exact equations', examTag: true },
          'Bernoulli equations',
          'Homogeneous equations',
          'Applications: mixing problems, population models',
        ],
      },
    ],
  },
  {
    icon: '📊',
    name: 'Phase 2: Second-Order Linear ODEs',
    description: 'Homogeneous and non-homogeneous equations',
    weeks: [
      {
        title: 'Week 9-10: Homogeneous',
        source: 'Boyce & DiPrima Ch. 3',
        topics: [
          { text: 'Characteristic equation method', examTag: true },
          { text: 'Real distinct roots', examTag: true },
          { text: 'Complex roots', examTag: true },
          'Repeated roots',
          'Wronskian and linear independence',
        ],
      },
      {
        title: 'Week 11-12: Non-Homogeneous',
        source: 'Boyce & DiPrima Ch. 3',
        topics: [
          { text: 'Method of undetermined coefficients', examTag: true },
          { text: 'Variation of parameters', examTag: true },
          'Superposition principle',
          'Applications: mechanical vibrations',
        ],
      },
    ],
  },
  {
    icon: '🔧',
    name: 'Phase 3: Laplace Transforms',
    description: 'Transform methods for solving ODEs',
    weeks: [
      {
        title: 'Week 13-14: Basic Transforms',
        source: 'Boyce & DiPrima Ch. 6',
        topics: [
          { text: 'Definition and properties', examTag: true },
          { text: 'Table of common transforms', examTag: true },
          'Linearity and shifting theorems',
          'Transform of derivatives',
        ],
      },
      {
        title: 'Week 15-16: Inverse & Applications',
        source: 'Boyce & DiPrima Ch. 6',
        topics: [
          { text: 'Inverse Laplace transforms', examTag: true },
          { text: 'Partial fractions', examTag: true },
          'Convolution theorem',
          'Solving IVPs with Laplace',
          'Step and impulse functions',
        ],
      },
    ],
  },
  {
    icon: '🎯',
    name: 'Phase 4: Systems & Review',
    description: 'Systems of ODEs and exam preparation',
    weeks: [
      {
        title: 'Week 17-18: Systems of ODEs',
        source: 'Boyce & DiPrima Ch. 7',
        topics: [
          'Matrix notation for systems',
          { text: 'Eigenvalue method', examTag: true },
          'Phase portraits',
          'Stability analysis',
        ],
      },
      {
        title: 'Week 19-20: Series Solutions',
        source: 'Boyce & DiPrima Ch. 5',
        topics: [
          'Power series review',
          'Series solutions near ordinary points',
          'Frobenius method (overview)',
        ],
      },
      {
        title: 'Week 21-25: Exam Prep',
        source: 'Past exams & problem sets',
        topics: [
          'Review all exam-tagged topics',
          'Timed practice exams',
          'Colosi\'s proof-style problems',
          'Common mistakes review',
          'Final formula sheet',
        ],
      },
    ],
  },
];

async function seed() {
  console.log('🌱 Starting seed...\n');

  // Check if data already exists
  const habitCount = await prisma.habit.count();
  const scheduleCount = await prisma.scheduleBlock.count();
  const studyCount = await prisma.studyPhase.count();

  if (habitCount > 0 || scheduleCount > 0 || studyCount > 0) {
    console.log('⚠️  Data already exists. Skipping seed.');
    console.log(`   Habits: ${habitCount}, Schedule: ${scheduleCount}, Study phases: ${studyCount}`);
    return;
  }

  // Seed habits
  console.log('✅ Creating habits...');
  for (let i = 0; i < DEFAULT_HABITS.length; i++) {
    const h = DEFAULT_HABITS[i];
    await prisma.habit.create({
      data: {
        icon: h.icon,
        name: h.name,
        freq: h.freq,
        days: JSON.stringify(h.days),
        position: i,
      },
    });
    console.log(`   ✓ ${h.icon} ${h.name}`);
  }

  // Seed schedule
  console.log('\n📅 Creating schedule blocks...');
  for (const block of DEFAULT_SCHEDULE) {
    await prisma.scheduleBlock.create({
      data: block,
    });
  }
  console.log(`   ✓ ${DEFAULT_SCHEDULE.length} blocks created`);

  // Seed study plan
  console.log('\n📐 Creating study plan...');
  for (let pi = 0; pi < STUDY_PLAN.length; pi++) {
    const phase = STUDY_PLAN[pi];
    const createdPhase = await prisma.studyPhase.create({
      data: {
        icon: phase.icon,
        name: phase.name,
        description: phase.description,
        position: pi,
      },
    });
    console.log(`   ✓ ${phase.icon} ${phase.name}`);

    for (let wi = 0; wi < phase.weeks.length; wi++) {
      const week = phase.weeks[wi];
      const createdWeek = await prisma.studyWeek.create({
        data: {
          phaseId: createdPhase.id,
          title: week.title,
          source: week.source || null,
          position: wi,
        },
      });

      for (let ti = 0; ti < week.topics.length; ti++) {
        const topic = week.topics[ti];
        const isObj = typeof topic === 'object';
        await prisma.studyTopic.create({
          data: {
            weekId: createdWeek.id,
            text: isObj ? (topic as any).text : topic,
            examTag: isObj ? (topic as any).examTag || false : false,
            position: ti,
          },
        });
      }
    }
  }

  const topicCount = await prisma.studyTopic.count();
  console.log(`   → ${topicCount} topics created`);

  console.log('\n✅ Seed complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
