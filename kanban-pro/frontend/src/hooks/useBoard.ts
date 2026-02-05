// Hook for managing board state

import { useState, useEffect, useCallback } from 'react';
import type { Board } from '../types';
import { boardsApi, columnsApi, cardsApi } from '../api/client';

export function useBoard(boardId: string | null) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!boardId) {
      setBoard(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await boardsApi.get(boardId);
      setBoard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // Card operations
  const createCard = async (columnId: string, title: string) => {
    const card = await cardsApi.create(columnId, title);
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns?.map((col) =>
          col.id === columnId
            ? { ...col, cards: [...(col.cards || []), card] }
            : col
        ),
      };
    });
    return card;
  };

  const updateCard = async (cardId: string, data: { title?: string; description?: string | null; dueDate?: string | null }) => {
    const updated = await cardsApi.update(cardId, data);
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns?.map((col) => ({
          ...col,
          cards: col.cards?.map((card) =>
            card.id === cardId ? { ...card, ...updated } : card
          ),
        })),
      };
    });
    return updated;
  };

  const deleteCard = async (cardId: string) => {
    await cardsApi.delete(cardId);
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns?.map((col) => ({
          ...col,
          cards: col.cards?.filter((card) => card.id !== cardId),
        })),
      };
    });
  };

  const moveCard = async (
    cardId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newPosition: number
  ) => {
    // Optimistic update
    setBoard((prev) => {
      if (!prev) return prev;

      const sourceColumn = prev.columns?.find((c) => c.id === sourceColumnId);
      const card = sourceColumn?.cards?.find((c) => c.id === cardId);
      if (!card) return prev;

      return {
        ...prev,
        columns: prev.columns?.map((col) => {
          if (col.id === sourceColumnId) {
            return {
              ...col,
              cards: col.cards?.filter((c) => c.id !== cardId),
            };
          }
          if (col.id === targetColumnId) {
            const cards = [...(col.cards || [])];
            cards.splice(newPosition, 0, { ...card, columnId: targetColumnId });
            return { ...col, cards };
          }
          return col;
        }),
      };
    });

    try {
      await cardsApi.move(cardId, targetColumnId, newPosition);
    } catch (err) {
      // Revert on error
      fetchBoard();
      throw err;
    }
  };

  // Column operations
  const createColumn = async (name: string) => {
    if (!boardId) return;
    const column = await columnsApi.create(boardId, name);
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: [...(prev.columns || []), { ...column, cards: [] }],
      };
    });
    return column;
  };

  const updateColumn = async (columnId: string, data: { name?: string; color?: string | null }) => {
    const updated = await columnsApi.update(columnId, data);
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns?.map((col) =>
          col.id === columnId ? { ...col, ...updated } : col
        ),
      };
    });
    return updated;
  };

  const deleteColumn = async (columnId: string) => {
    await columnsApi.delete(columnId);
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns?.filter((col) => col.id !== columnId),
      };
    });
  };

  return {
    board,
    loading,
    error,
    refetch: fetchBoard,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    createColumn,
    updateColumn,
    deleteColumn,
  };
}
