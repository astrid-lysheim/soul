// Column component

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CardItem } from './Card';
import type { Column as ColumnType } from '../types';
import { Trash2, Plus } from 'lucide-react';

interface ColumnProps {
  column: ColumnType;
  onCreateCard: (columnId: string, title: string) => Promise<unknown>;
  onDeleteColumn: (columnId: string) => Promise<void>;
  onCardClick: (cardId: string) => void;
}

export function Column({
  column,
  onCreateCard,
  onDeleteColumn,
  onCardClick,
}: ColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const cards = column.cards || [];

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    await onCreateCard(column.id, newCardTitle.trim());
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  const handleDeleteColumn = async () => {
    if (cards.length > 0) {
      const confirm = window.confirm(
        `Delete "${column.name}" and all ${cards.length} cards in it?`
      );
      if (!confirm) return;
    }
    await onDeleteColumn(column.id);
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-gray-100 rounded-xl p-3 flex flex-col max-h-[calc(100vh-180px)] ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          {column.name}
          <span className="text-xs font-normal text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </h3>
        <button
          onClick={handleDeleteColumn}
          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
          title="Delete column"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto kanban-column space-y-2">
        <SortableContext
          items={cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => onCardClick(card.id)}
            />
          ))}
        </SortableContext>

        {/* Add card form */}
        {isAddingCard ? (
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <textarea
              autoFocus
              placeholder="Enter card title..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard();
                }
                if (e.key === 'Escape') {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }
              }}
              className="w-full p-2 text-sm border border-gray-200 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddCard}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
                className="px-3 py-1 text-gray-600 text-sm hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full p-2 text-sm text-gray-500 hover:bg-gray-200 rounded-lg flex items-center gap-1 justify-center transition-colors"
          >
            <Plus size={16} />
            Add Card
          </button>
        )}
      </div>
    </div>
  );
}
