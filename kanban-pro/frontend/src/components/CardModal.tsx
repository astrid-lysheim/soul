// Card detail modal - edit title, description, labels, due date, checklist

import { useState, useEffect } from 'react';
import { X, Calendar, Tag, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { cardsApi, labelsApi, checklistApi } from '../api/client';
import type { Card, Label, ChecklistItem } from '../types';

interface CardModalProps {
  cardId: string;
  boardId: string;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export function CardModal({ cardId, boardId, onClose, onUpdate, onDelete }: CardModalProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [boardLabels, setBoardLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [_saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [cardId, boardId]);

  const loadData = async () => {
    try {
      const [cardData, labelsData] = await Promise.all([
        cardsApi.get(cardId),
        labelsApi.list(boardId),
      ]);
      setCard(cardData);
      setBoardLabels(labelsData);
      setTitle(cardData.title);
      setDescription(cardData.description || '');
      setDueDate(cardData.dueDate ? cardData.dueDate.split('T')[0] : '');
    } catch (err) {
      console.error('Failed to load card:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCard = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await cardsApi.update(cardId, {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate || null,
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to save card:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleLabel = async (labelId: string) => {
    if (!card) return;
    const hasLabel = card.labels?.some((l) => l.id === labelId);
    try {
      if (hasLabel) {
        await cardsApi.removeLabel(cardId, labelId);
      } else {
        await cardsApi.addLabel(cardId, labelId);
      }
      await loadData();
      onUpdate();
    } catch (err) {
      console.error('Failed to toggle label:', err);
    }
  };

  const addChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;
    try {
      await checklistApi.create(cardId, newChecklistItem.trim());
      setNewChecklistItem('');
      await loadData();
      onUpdate();
    } catch (err) {
      console.error('Failed to add checklist item:', err);
    }
  };

  const toggleChecklistItem = async (item: ChecklistItem) => {
    try {
      await checklistApi.update(item.id, { completed: !item.completed });
      await loadData();
      onUpdate();
    } catch (err) {
      console.error('Failed to toggle checklist item:', err);
    }
  };

  const deleteChecklistItem = async (itemId: string) => {
    try {
      await checklistApi.delete(itemId);
      await loadData();
      onUpdate();
    } catch (err) {
      console.error('Failed to delete checklist item:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this card?')) return;
    try {
      await cardsApi.delete(cardId);
      onDelete();
      onClose();
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">Loading...</div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-200">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveCard}
              className="text-xl font-semibold w-full border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 -ml-2"
              placeholder="Card title..."
            />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Labels */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Labels</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {card.labels?.map((label) => (
                <span
                  key={label.id}
                  className="px-3 py-1 text-sm font-medium rounded-full text-white cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: label.color }}
                  onClick={() => toggleLabel(label.id)}
                >
                  {label.name} ×
                </span>
              ))}
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            {showLabelPicker && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Click to add/remove:</div>
                <div className="flex flex-wrap gap-2">
                  {boardLabels.map((label) => {
                    const isSelected = card.labels?.some((l) => l.id === label.id);
                    return (
                      <button
                        key={label.id}
                        onClick={() => toggleLabel(label.id)}
                        className={`px-3 py-1 text-sm font-medium rounded-full text-white transition-all ${
                          isSelected ? 'ring-2 ring-offset-2 ring-gray-400' : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Due Date</span>
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={saveCard}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {dueDate && (
              <button
                onClick={() => {
                  setDueDate('');
                  setTimeout(saveCard, 0);
                }}
                className="ml-2 text-sm text-gray-400 hover:text-red-500"
              >
                Clear
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Description</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveCard}
              placeholder="Add a more detailed description..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y"
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Checklist</span>
              {card.checklistItems && card.checklistItems.length > 0 && (
                <span className="text-xs text-gray-400">
                  ({card.checklistItems.filter((i) => i.completed).length}/{card.checklistItems.length})
                </span>
              )}
            </div>
            
            {/* Progress bar */}
            {card.checklistItems && card.checklistItems.length > 0 && (
              <div className="w-full h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${(card.checklistItems.filter((i) => i.completed).length / card.checklistItems.length) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Items */}
            <div className="space-y-2">
              {card.checklistItems?.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleChecklistItem(item)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center text-xs transition-all ${
                      item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {item.completed && '✓'}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      item.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteChecklistItem(item.id)}
                    className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add item */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={addChecklistItem}
                disabled={!newChecklistItem.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
          >
            Delete Card
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
