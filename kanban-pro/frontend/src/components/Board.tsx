// Board component with drag-and-drop

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useBoard } from '../hooks/useBoard';
import { Column } from './Column';
import { CardItem } from './Card';
import { CardModal } from './CardModal';
import type { Card } from '../types';

interface BoardProps {
  boardId: string;
}

export function Board({ boardId }: BoardProps) {
  const {
    board,
    loading,
    error,
    refetch,
    createCard,
    moveCard,
    createColumn,
    deleteColumn,
  } = useBoard(boardId);

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board?.columns
      ?.flatMap((col) => col.cards || [])
      .find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Handle drag over for visual feedback if needed
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || !board?.columns) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source card and column
    let sourceColumnId: string | null = null;
    let sourceCard: Card | null = null;

    for (const col of board.columns) {
      const card = col.cards?.find((c) => c.id === activeId);
      if (card) {
        sourceColumnId = col.id;
        sourceCard = card;
        break;
      }
    }

    if (!sourceColumnId || !sourceCard) return;

    // Determine target column and position
    let targetColumnId: string | null = null;
    let targetPosition = 0;

    // Check if dropped on a column
    const targetColumn = board.columns.find((col) => col.id === overId);
    if (targetColumn) {
      targetColumnId = targetColumn.id;
      targetPosition = targetColumn.cards?.length || 0;
    } else {
      // Dropped on another card - find its column
      for (const col of board.columns) {
        const cardIndex = col.cards?.findIndex((c) => c.id === overId);
        if (cardIndex !== undefined && cardIndex >= 0) {
          targetColumnId = col.id;
          targetPosition = cardIndex;
          break;
        }
      }
    }
    
    if (!targetColumnId) return;

    // Don't move if same position
    if (
      sourceColumnId === targetColumnId &&
      sourceCard.position === targetPosition
    ) {
      return;
    }

    try {
      await moveCard(activeId, sourceColumnId, targetColumnId, targetPosition);
    } catch (err) {
      console.error('Failed to move card:', err);
    }
  };

  const handleAddColumn = async () => {
    const name = prompt('Column name:');
    if (name) {
      await createColumn(name);
    }
  };

  const handleCardClick = (cardId: string) => {
    setSelectedCardId(cardId);
  };

  const handleModalClose = () => {
    setSelectedCardId(null);
  };

  const handleCardUpdate = () => {
    refetch();
  };

  const handleCardDelete = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="text-xl text-gray-600">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="text-xl text-gray-600">Board not found</div>
      </div>
    );
  }

  const columns = board.columns || [];

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <SortableContext
            items={columns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onCreateCard={createCard}
                onDeleteColumn={deleteColumn}
                onCardClick={handleCardClick}
              />
            ))}
          </SortableContext>

          {/* Add column button */}
          <button
            onClick={handleAddColumn}
            className="flex-shrink-0 w-72 h-fit p-4 bg-gray-200/50 hover:bg-gray-200 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:text-gray-700 transition-colors"
          >
            + Add Column
          </button>
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="rotate-3">
              <CardItem card={activeCard} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Card Modal */}
      {selectedCardId && (
        <CardModal
          cardId={selectedCardId}
          boardId={boardId}
          onClose={handleModalClose}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}
    </>
  );
}
