/**
 * Migration script: Import data from legacy kanban/board.json
 * 
 * Run with: npm run migrate:legacy
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Legacy board structure
interface LegacyCard {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  column: string;
  created: string;
  updated?: string;
}

interface LegacyBoard {
  columns: string[];
  categories: string[];
  cards: LegacyCard[];
}

// Priority to color mapping
const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',    // red
  medium: '#f97316',  // orange
  low: '#6b7280',     // gray
};

// Category to color mapping (based on emoji)
const CATEGORY_COLORS: Record<string, string> = {
  '🏔️ Norway': '#3b82f6',   // blue
  '📱 Reed': '#8b5cf6',      // purple
  '💼 Career': '#22c55e',    // green
  '🧠 Growth': '#ec4899',    // pink
  '🔧 Infra': '#6b7280',     // gray
};

async function migrate() {
  console.log('🚀 Starting legacy migration...\n');

  // Load legacy data
  const legacyPath = join(__dirname, '../../../kanban/board.json');
  const legacyData: LegacyBoard = JSON.parse(readFileSync(legacyPath, 'utf-8'));

  console.log(`📂 Loaded legacy board:`);
  console.log(`   - ${legacyData.columns.length} columns`);
  console.log(`   - ${legacyData.categories.length} categories`);
  console.log(`   - ${legacyData.cards.length} cards\n`);

  // Check if board already exists
  const existingBoard = await prisma.board.findFirst({
    where: { name: 'Main Board' },
  });

  if (existingBoard) {
    console.log('⚠️  Board already exists. Skipping migration.');
    console.log('   To re-run, delete the existing board first.\n');
    return;
  }

  // Create board
  console.log('📋 Creating board...');
  const board = await prisma.board.create({
    data: { name: 'Main Board' },
  });

  // Create columns
  console.log('📊 Creating columns...');
  const columnMap = new Map<string, string>(); // name -> id

  for (let i = 0; i < legacyData.columns.length; i++) {
    const name = legacyData.columns[i];
    const column = await prisma.column.create({
      data: {
        boardId: board.id,
        name,
        position: i,
      },
    });
    columnMap.set(name, column.id);
    console.log(`   ✓ ${name}`);
  }

  // Create labels from categories
  console.log('\n🏷️  Creating category labels...');
  const categoryLabelMap = new Map<string, string>(); // category -> labelId

  for (const category of legacyData.categories) {
    const label = await prisma.label.create({
      data: {
        boardId: board.id,
        name: category,
        color: CATEGORY_COLORS[category] || '#6b7280',
      },
    });
    categoryLabelMap.set(category, label.id);
    console.log(`   ✓ ${category}`);
  }

  // Create labels from priorities
  console.log('\n⚡ Creating priority labels...');
  const priorityLabelMap = new Map<string, string>(); // priority -> labelId

  for (const [priority, color] of Object.entries(PRIORITY_COLORS)) {
    const label = await prisma.label.create({
      data: {
        boardId: board.id,
        name: `Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}`,
        color,
      },
    });
    priorityLabelMap.set(priority, label.id);
    console.log(`   ✓ Priority: ${priority}`);
  }

  // Create cards
  console.log('\n📝 Creating cards...');
  
  // Group cards by column for proper positioning
  const cardsByColumn = new Map<string, LegacyCard[]>();
  for (const card of legacyData.cards) {
    const existing = cardsByColumn.get(card.column) || [];
    existing.push(card);
    cardsByColumn.set(card.column, existing);
  }

  let totalCards = 0;
  for (const [columnName, cards] of cardsByColumn) {
    const columnId = columnMap.get(columnName);
    if (!columnId) {
      console.log(`   ⚠️  Unknown column: ${columnName}, skipping ${cards.length} cards`);
      continue;
    }

    for (let i = 0; i < cards.length; i++) {
      const legacy = cards[i];
      
      // Create card
      const card = await prisma.card.create({
        data: {
          columnId,
          title: legacy.title,
          description: legacy.description || null,
          position: i,
          createdAt: new Date(legacy.created),
          updatedAt: legacy.updated ? new Date(legacy.updated) : new Date(legacy.created),
        },
      });

      // Attach category label
      const categoryLabelId = categoryLabelMap.get(legacy.category);
      if (categoryLabelId) {
        await prisma.cardLabel.create({
          data: {
            cardId: card.id,
            labelId: categoryLabelId,
          },
        });
      }

      // Attach priority label
      const priorityLabelId = priorityLabelMap.get(legacy.priority);
      if (priorityLabelId) {
        await prisma.cardLabel.create({
          data: {
            cardId: card.id,
            labelId: priorityLabelId,
          },
        });
      }

      totalCards++;
    }
    console.log(`   ✓ ${columnName}: ${cards.length} cards`);
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   - 1 board created`);
  console.log(`   - ${legacyData.columns.length} columns`);
  console.log(`   - ${categoryLabelMap.size + priorityLabelMap.size} labels`);
  console.log(`   - ${totalCards} cards imported\n`);
}

migrate()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
