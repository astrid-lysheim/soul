/**
 * Add Multivariate Statistics and Norwegian to Study Plan
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MULTIVARIATE_STATS = {
  icon: '📊',
  name: 'Multivariate Statistics',
  description: 'Regression, PCA, Factor Analysis, Clustering, Discriminant Analysis',
  weeks: [
    {
      title: 'Week 16: Multiple Regression',
      source: 'Syllabus Unit 1, Johnson & Wichern Ch 7',
      topics: [
        { text: 'Least squares estimation (matrix form: β = (X\'X)⁻¹X\'y)', examTag: true },
        { text: 'Goodness of fit: R², adjusted R², F-test', examTag: true },
        'Variable selection: forward, backward, stepwise',
        'Residual analysis',
      ],
    },
    {
      title: 'Week 17: Principal Component Analysis',
      source: 'Syllabus Unit 2, Shlens PCA tutorial',
      topics: [
        { text: 'Covariance matrix decomposition', examTag: true },
        { text: 'Eigenvalue/eigenvector interpretation', examTag: true },
        'Scree plot, proportion of variance explained',
        'How many components to keep',
      ],
    },
    {
      title: 'Week 18: Factor Analysis',
      source: 'Syllabus Unit 3, Johnson & Wichern',
      topics: [
        { text: 'Factor model: X = ΛF + ε', examTag: true },
        'Extraction methods (principal axis, ML)',
        { text: 'Rotation (varimax, promax)', examTag: true },
        'Comparison with PCA (they\'re NOT the same!)',
      ],
    },
    {
      title: 'Week 19: Cluster Analysis',
      source: 'Syllabus Unit 4, Johnson & Wichern Ch 12',
      topics: [
        { text: 'Distance metrics (Euclidean, Mahalanobis, Manhattan)', examTag: true },
        'Hierarchical methods (single/complete/average linkage)',
        { text: 'Partitioning methods (k-means)', examTag: true },
        'Dendrograms: reading and interpreting',
      ],
    },
    {
      title: 'Week 20: Discriminant Analysis',
      source: 'Syllabus Unit 5, Johnson & Wichern Ch 11',
      topics: [
        { text: 'Fisher\'s linear discriminant', examTag: true },
        'Two-group and multiple-group discrimination',
        'Logistic discrimination',
        { text: 'Classification error rates', examTag: true },
      ],
    },
    {
      title: 'Week 21: Software Practice + Integration',
      source: 'Python/R practice',
      topics: [
        'Run PCA, FA, cluster, discriminant on real datasets',
        'Interpret output (loadings, scree plots, dendrograms)',
        'Decision flowchart: data + question → method',
        'Practice mixed problems',
      ],
    },
  ],
};

const NORWEGIAN = {
  icon: '🇳🇴',
  name: 'Norwegian (A2→B1+)',
  description: 'Stein på stein textbook — 14 chapters to B1 level',
  weeks: [
    {
      title: 'Phase 0: Diagnostic',
      source: 'På vei review',
      topics: [
        'Review På vei grammar progression',
        'Identify gaps vs. solid knowledge',
        'Determine starting point for Stein på stein',
      ],
    },
    {
      title: 'Ch 1: Hva driver du med?',
      source: 'Stein på stein',
      topics: [
        'Personal situations vocabulary',
        'Work and daily life expressions',
        'Present tense review',
      ],
    },
    {
      title: 'Ch 2: Familie og hverdagsliv',
      source: 'Stein på stein',
      topics: [
        'Family structures vocabulary',
        'Gender roles in Norwegian society',
        'Possessive pronouns',
      ],
    },
    {
      title: 'Ch 3: Bolig og økonomi',
      source: 'Stein på stein',
      topics: [
        'Housing market vocabulary',
        'Expenses and economy',
        'Numbers and prices',
      ],
    },
    {
      title: 'Ch 4: Mat og helse',
      source: 'Stein på stein',
      topics: [
        'Health vocabulary',
        'Diet and food traditions',
        'Body parts',
      ],
    },
    {
      title: 'Ch 5: Massemedier og informasjon',
      source: 'Stein på stein',
      topics: [
        'Media vocabulary',
        'News and information',
        'Reading comprehension',
      ],
    },
    {
      title: 'Ch 6: Skole og utdanning',
      source: 'Stein på stein',
      topics: [
        'Education system vocabulary',
        'School types in Norway',
        'Past tense (preteritum)',
      ],
    },
    {
      title: 'Ch 7: Ut i arbeid',
      source: 'Stein på stein',
      topics: [
        'Job seeking vocabulary',
        'Workplace equality',
        'Writing CVs and applications',
      ],
    },
    {
      title: 'Ch 8: Norge i gamle dager',
      source: 'Stein på stein',
      topics: [
        'Historical Norway vocabulary',
        'Past tense (preteritum) practice',
        'Time expressions',
      ],
    },
    {
      title: 'Ch 9: Utvandring og innvandring',
      source: 'Stein på stein',
      topics: [
        'Emigration & immigration vocabulary',
        'Norwegian diaspora history',
        'Subordinate clauses',
      ],
    },
    {
      title: 'Ch 10: Det var en gang',
      source: 'Stein på stein',
      topics: [
        'Fairy tales and folklore',
        'Storytelling in Norwegian',
        'Past perfect tense',
      ],
    },
    {
      title: 'Ch 11: Noen glimt fra Norges historie',
      source: 'Stein på stein',
      topics: [
        'History highlights vocabulary',
        'Important dates and events',
        'Passive voice',
      ],
    },
    {
      title: 'Ch 12: Næringsliv og arbeid i dag',
      source: 'Stein på stein',
      topics: [
        'Economy vocabulary',
        'Oil industry and modern Norway',
        'Future tense',
      ],
    },
    {
      title: 'Ch 13: Velferdsstaten',
      source: 'Stein på stein',
      topics: [
        'Welfare state vocabulary',
        'Social security system',
        'Norwegian values (dugnad, etc.)',
      ],
    },
    {
      title: 'Ch 14: Om menneskerettigheter og likeverd',
      source: 'Stein på stein',
      topics: [
        'Human rights vocabulary',
        'Equality and dignity',
        'B1 grammar consolidation',
      ],
    },
  ],
};

async function seed() {
  console.log('🌱 Adding Multivariate Stats and Norwegian to Study Plan...\n');

  // Check if they already exist
  const existing = await prisma.studyPhase.findMany({
    where: {
      OR: [
        { name: { contains: 'Multivariate' } },
        { name: { contains: 'Norwegian' } },
      ],
    },
  });

  if (existing.length > 0) {
    console.log('⚠️  Some phases already exist:');
    existing.forEach(p => console.log(`   - ${p.icon} ${p.name}`));
    console.log('   Skipping to avoid duplicates.\n');
    return;
  }

  // Get max position
  const maxPos = await prisma.studyPhase.aggregate({
    _max: { position: true },
  });
  let position = (maxPos._max.position ?? -1) + 1;

  // Add Multivariate Stats
  console.log('📊 Adding Multivariate Statistics...');
  const statsPhase = await prisma.studyPhase.create({
    data: {
      icon: MULTIVARIATE_STATS.icon,
      name: MULTIVARIATE_STATS.name,
      description: MULTIVARIATE_STATS.description,
      position: position++,
    },
  });

  for (let wi = 0; wi < MULTIVARIATE_STATS.weeks.length; wi++) {
    const week = MULTIVARIATE_STATS.weeks[wi];
    const createdWeek = await prisma.studyWeek.create({
      data: {
        phaseId: statsPhase.id,
        title: week.title,
        source: week.source,
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
    console.log(`   ✓ ${week.title}`);
  }

  // Add Norwegian
  console.log('\n🇳🇴 Adding Norwegian...');
  const norskPhase = await prisma.studyPhase.create({
    data: {
      icon: NORWEGIAN.icon,
      name: NORWEGIAN.name,
      description: NORWEGIAN.description,
      position: position++,
    },
  });

  for (let wi = 0; wi < NORWEGIAN.weeks.length; wi++) {
    const week = NORWEGIAN.weeks[wi];
    const createdWeek = await prisma.studyWeek.create({
      data: {
        phaseId: norskPhase.id,
        title: week.title,
        source: week.source,
        position: wi,
      },
    });

    for (let ti = 0; ti < week.topics.length; ti++) {
      const topic = week.topics[ti];
      const isObj = typeof topic === 'object';
      await prisma.studyTopic.create({
        data: {
          weekId: createdWeek.id,
          text: isObj ? (topic as any).text : topic as string,
          examTag: isObj ? (topic as any).examTag || false : false,
          position: ti,
        },
      });
    }
    console.log(`   ✓ ${week.title}`);
  }

  const topicCount = await prisma.studyTopic.count();
  console.log(`\n✅ Done! Total topics now: ${topicCount}`);
}

seed()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
