// Schedule block modal - create/edit/delete schedule blocks

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { scheduleApi, type ScheduleBlock } from '../api/client';

const DAY_OPTIONS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

const COLOR_OPTIONS = [
  { value: 'blue', label: '🔵 Blue', class: 'bg-blue-500' },
  { value: 'green', label: '🟢 Green', class: 'bg-green-500' },
  { value: 'orange', label: '🟠 Orange', class: 'bg-orange-500' },
  { value: 'purple', label: '🟣 Purple', class: 'bg-purple-500' },
  { value: 'red', label: '🔴 Red', class: 'bg-red-500' },
  { value: 'teal', label: '🩵 Teal', class: 'bg-teal-500' },
  { value: 'pink', label: '💗 Pink', class: 'bg-pink-500' },
  { value: 'indigo', label: '🔷 Indigo', class: 'bg-indigo-500' },
];

interface ScheduleModalProps {
  block?: ScheduleBlock | null; // null = creating new
  defaultDay?: number;
  defaultTime?: string;
  onClose: () => void;
  onSave: () => void;
}

export function ScheduleModal({
  block,
  defaultDay,
  defaultTime,
  onClose,
  onSave,
}: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(0);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  const [color, setColor] = useState('blue');
  const [repeat, setRepeat] = useState('weekly');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setDay(block.day);
      setStartTime(block.startTime);
      setDuration(block.duration);
      setColor(block.color);
      setRepeat(block.repeat);
    } else {
      // New block - use defaults
      setDay(defaultDay ?? 0);
      setStartTime(defaultTime ?? '09:00');
    }
  }, [block, defaultDay, defaultTime]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      if (block) {
        // Update existing
        await scheduleApi.update(block.id, {
          title: title.trim(),
          day,
          startTime,
          duration,
          color,
          repeat,
        });
      } else {
        // Create new
        await scheduleApi.create({
          title: title.trim(),
          day,
          startTime,
          duration,
          color,
          repeat,
        });
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save block:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!block) return;
    if (!confirm('Delete this schedule block?')) return;

    try {
      await scheduleApi.delete(block.id);
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to delete block:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {block ? 'Edit Block' : 'New Block'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's happening?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day
            </label>
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DAY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={0.5}
                max={18}
                step={0.5}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setColor(opt.value)}
                  className={`w-8 h-8 rounded-lg ${opt.class} ${
                    color === opt.value
                      ? 'ring-2 ring-offset-2 ring-gray-400'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repeats
            </label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">This week only</option>
              <option value="weekly">Every week</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {block ? (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
            >
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
