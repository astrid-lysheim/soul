// Main App component with tabs

import { useState, useEffect } from 'react';
import { Board } from './components/Board';
import { Habits } from './components/Habits';
import { Schedule } from './components/Schedule';
import { Study } from './components/Study';
import { boardsApi } from './api/client';
import type { Board as BoardType } from './types';
import { LayoutGrid, CheckSquare, Calendar, BookOpen } from 'lucide-react';

type Tab = 'board' | 'habits' | 'schedule' | 'study';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'board', label: 'Board', icon: <LayoutGrid size={16} /> },
  { id: 'habits', label: 'Habits', icon: <CheckSquare size={16} /> },
  { id: 'schedule', label: 'Schedule', icon: <Calendar size={16} /> },
  { id: 'study', label: 'Study', icon: <BookOpen size={16} /> },
];

function App() {
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('board');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoards();
    // Restore active tab from localStorage
    const savedTab = localStorage.getItem('mc_active_tab') as Tab | null;
    if (savedTab && TABS.some((t) => t.id === savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  const loadBoards = async () => {
    try {
      const data = await boardsApi.list();
      setBoards(data);
      // Auto-select first board
      if (data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    const name = prompt('Board name:');
    if (!name) return;

    const board = await boardsApi.create(name);
    setBoards((prev) => [...prev, board]);
    setSelectedBoardId(board.id);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem('mc_active_tab', tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">
              Astrid & José — <span className="text-blue-600">Mission Control</span> 🏔️
            </h1>

            {/* Board selector (only show on board tab) */}
            {activeTab === 'board' && (
              <>
                <select
                  value={selectedBoardId || ''}
                  onChange={(e) => setSelectedBoardId(e.target.value || null)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a board...</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={createBoard}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  + New Board
                </button>
              </>
            )}
          </div>

          <div className="text-sm text-gray-500">Built with 💙 by Astrid</div>
        </div>

        {/* Tabs */}
        <div className="px-4 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 border-gray-200'
                  : 'bg-white text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main>
        {activeTab === 'board' && (
          <div className="p-4">
            {selectedBoardId ? (
              <Board boardId={selectedBoardId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-gray-500">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-xl">Select or create a board to get started</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'habits' && <Habits />}
        {activeTab === 'schedule' && <Schedule />}
        {activeTab === 'study' && <Study />}
      </main>
    </div>
  );
}

export default App;
