// Weekly schedule component with editing

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { scheduleApi, type ScheduleBlock } from '../api/client';
import { ScheduleModal } from './ScheduleModal';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  teal: 'bg-teal-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
};

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function Schedule() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [defaultDay, setDefaultDay] = useState<number | undefined>();
  const [defaultTime, setDefaultTime] = useState<string | undefined>();

  const dates = getWeekDates(weekOffset);

  const loadBlocks = async () => {
    try {
      const data = await scheduleApi.list();
      setBlocks(data);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const weekLabel = `${dates[0].toLocaleDateString('en', { month: 'short', day: 'numeric' })} — ${dates[6].toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const getBlocksForDay = (day: number) => {
    return blocks.filter((b) => b.day === day);
  };

  const getBlockStyle = (block: ScheduleBlock) => {
    const startMinutes = timeToMinutes(block.startTime);
    const startHour = startMinutes / 60 - 6; // Offset from 6 AM
    const top = startHour * 48; // 48px per hour
    const height = block.duration * 48;
    return { top: `${top}px`, height: `${height}px` };
  };

  const handleBlockClick = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setDefaultDay(undefined);
    setDefaultTime(undefined);
    setModalOpen(true);
  };

  const handleCellClick = (day: number, hour: number) => {
    setEditingBlock(null);
    setDefaultDay(day);
    setDefaultTime(`${hour.toString().padStart(2, '0')}:00`);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingBlock(null);
    setDefaultDay(0);
    setDefaultTime('09:00');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingBlock(null);
  };

  const handleModalSave = () => {
    loadBlocks();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-full">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-700">{weekLabel}</span>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus size={16} /> Add Block
          </button>
        </div>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-auto max-h-[calc(100vh-200px)]">
        <div className="grid min-w-[800px]" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          {/* Header Row */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 p-2 text-right text-xs font-semibold text-gray-400">
            TIME
          </div>
          {dates.map((d, i) => (
            <div
              key={i}
              className={`sticky top-0 z-10 bg-gray-50 border-b border-gray-200 p-2 text-center text-xs font-semibold ${
                isToday(d) ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {DAY_NAMES[i]}
              <br />
              <span className="font-normal">{d.getDate()}</span>
            </div>
          ))}

          {/* Time rows */}
          {HOURS.map((hour) => (
            <>
              {/* Time label */}
              <div
                key={`time-${hour}`}
                className="border-r border-gray-100 px-2 text-right text-xs text-gray-400"
                style={{ height: '48px' }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* Day cells */}
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <div
                  key={`cell-${hour}-${day}`}
                  className="relative border-b border-r border-gray-50 cursor-pointer hover:bg-blue-50/50 transition-colors"
                  style={{ height: '48px' }}
                  onClick={() => handleCellClick(day, hour)}
                >
                  {/* Render blocks that start in this cell */}
                  {hour === 6 &&
                    getBlocksForDay(day).map((block) => (
                      <div
                        key={block.id}
                        className={`absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 text-white text-xs font-medium overflow-hidden cursor-pointer hover:opacity-90 transition-opacity z-10 ${
                          COLOR_CLASSES[block.color] || 'bg-blue-500'
                        }`}
                        style={getBlockStyle(block)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlockClick(block);
                        }}
                        title={`${block.title}\n${block.startTime} (${block.duration}h)\nClick to edit`}
                      >
                        <div className="truncate">{block.title}</div>
                        <div className="text-[10px] opacity-80">{block.startTime}</div>
                      </div>
                    ))}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2 text-center">
        Click on a time slot to add a block, or click on an existing block to edit it
      </p>

      {/* Modal */}
      {modalOpen && (
        <ScheduleModal
          block={editingBlock}
          defaultDay={defaultDay}
          defaultTime={defaultTime}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
