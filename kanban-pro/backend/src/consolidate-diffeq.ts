/**
 * Consolidate DiffEq phases into one, matching MVS and Norwegian structure
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function consolidate() {
  console.log('🔧 Consolidating Differential Equations phases...\n');

  // Get all current phases
  const phases = await prisma.studyPhase.findMany({
    orderBy: { position: 'asc' },
    include: {
      weeks: {
        orderBy: { position: 'asc' },
        include: {
          topics: { orderBy: { position: 'asc' } },
        },
      },
    },
  });

  // Find the DiffEq phases (0-4)
  const diffEqPhases = phases.filter(p => 
    p.name.includes('Phase 0') || 
    p.name.includes('Phase 1') || 
    p.name.includes('Phase 2') || 
    p.name.includes('Phase 3') || 
    p.name.includes('Phase 4')
  );

  if (diffEqPhases.length === 0) {
    console.log('⚠️  No DiffEq phases found to consolidate.');
    return;
  }

  console.log(`Found ${diffEqPhases.length} DiffEq phases to consolidate:`);
  diffEqPhases.forEach(p => console.log(`   - ${p.icon} ${p.name}`));

  // Create new consolidated DiffEq phase at position 0
  console.log('\n📐 Creating consolidated Differential Equations phase...');
  
  const newPhase = await prisma.studyPhase.create({
    data: {
      icon: '📐',
      name: 'Differential Equations',
      description: 'First-order, second-order, Laplace transforms, systems — Colosi style',
      position: 0,
    },
  });

  // Move all weeks to the new phase, renaming them to include the original phase context
  let weekPosition = 0;
  
  for (const oldPhase of diffEqPhases) {
    // Extract phase name (e.g., "Foundation" from "Phase 0: Foundation")
    const phaseName = oldPhase.name.replace(/Phase \d+:\s*/, '');
    
    for (const week of oldPhase.weeks) {
      // Create new week title that includes phase context
      const newTitle = `${phaseName}: ${week.title}`;
      
      // Update the week to belong to new phase
      await prisma.studyWeek.update({
        where: { id: week.id },
        data: {
          phaseId: newPhase.id,
          title: newTitle,
          position: weekPosition++,
        },
      });
      
      console.log(`   ✓ Moved: ${newTitle}`);
    }
  }

  // Delete old phases
  console.log('\n🗑️  Deleting old phases...');
  for (const oldPhase of diffEqPhases) {
    await prisma.studyPhase.delete({ where: { id: oldPhase.id } });
    console.log(`   ✓ Deleted: ${oldPhase.name}`);
  }

  // Reorder remaining phases
  console.log('\n🔢 Reordering phases...');
  const remainingPhases = await prisma.studyPhase.findMany({
    orderBy: { position: 'asc' },
  });

  for (let i = 0; i < remainingPhases.length; i++) {
    await prisma.studyPhase.update({
      where: { id: remainingPhases[i].id },
      data: { position: i },
    });
  }

  // Final count
  const finalPhases = await prisma.studyPhase.findMany({
    orderBy: { position: 'asc' },
    include: { weeks: { include: { topics: true } } },
  });

  console.log('\n✅ Consolidation complete! New structure:');
  finalPhases.forEach(p => {
    const topicCount = p.weeks.reduce((sum, w) => sum + w.topics.length, 0);
    console.log(`   ${p.icon} ${p.name} (${p.weeks.length} weeks, ${topicCount} topics)`);
  });
}

consolidate()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
