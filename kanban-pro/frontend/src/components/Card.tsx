// Card component with drag support

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '../types';
import { Calendar, CheckSquare } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

interface CardItemProps {
  card: Card;
  isDragging?: boolean;
  onClick?: () => void;
}

export function CardItem({ card, isDragging, onClick }: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const checklistTotal = card.checklistItems?.length || 0;
  const checklistDone =
    card.checklistItems?.filter((item) => item.completed).length || 0;

  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);

  const handleClick = () => {
    // Don't open modal if we're dragging
    if (isSortableDragging) return;
    onClick?.();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing group hover:shadow-md hover:border-blue-300 transition-all ${
        isDragging || isSortableDragging ? 'opacity-50 shadow-lg rotate-2' : ''
      }`}
    >
      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: label.color }}
              title={label.name}
            >
              {label.name.length > 15
                ? label.name.slice(0, 15) + '...'
                : label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-800 mb-2">{card.title}</h4>

      {/* Description preview */}
      {card.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Footer with metadata */}
      {(dueDate || checklistTotal > 0) && (
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
          {/* Due date */}
          {dueDate && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue
                  ? 'text-red-500'
                  : isDueToday
                  ? 'text-orange-500'
                  : ''
              }`}
            >
              <Calendar size={12} />
              {format(dueDate, 'MMM d')}
            </span>
          )}

          {/* Checklist progress */}
          {checklistTotal > 0 && (
            <span
              className={`flex items-center gap-1 ${
                checklistDone === checklistTotal ? 'text-green-500' : ''
              }`}
            >
              <CheckSquare size={12} />
              {checklistDone}/{checklistTotal}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
