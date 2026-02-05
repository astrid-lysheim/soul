// Habits tracking component

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { habitsApi, type Habit, type HabitLog } from '../api/client';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isToday(d: Date): boolean {
  return fmtDate(d) === fmtDate(new Date());
}

export function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog>({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const dates = getWeekDates(weekOffset);

  const loadData = useCallback(async () => {
    try {
      const [habitsData, logsData] = await Promise.all([
        habitsApi.list(),
        habitsApi.getLogs(fmtDate(dates[0]), fmtDate(dates[6])),
      ]);
      setHabits(habitsData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleHabit = async (habitId: string, date: string) => {
    // Optimistic update
    setLogs((prev) => {
      const newLogs = { ...prev };
      if (!newLogs[date]) newLogs[date] = {};
      newLogs[date] = { ...newLogs[date], [habitId]: !newLogs[date]?.[habitId] };
      return newLogs;
    });

    try {
      await habitsApi.toggleLog(habitId, date);
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      loadData(); // Revert on error
    }
  };

  const getStreak = (habit: Habit): number => {
    // Calculate streak (simplified - counts consecutive days going backwards)
    let streak = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1); // Start from yesterday

    for (let i = 0; i < 365; i++) {
      const key = fmtDate(d);
      const dayOfWeek = (d.getDay() + 6) % 7;

      if (habit.days.includes(dayOfWeek)) {
        if (logs[key]?.[habit.id]) {
          streak++;
        } else {
          break;
        }
      }
      d.setDate(d.getDate() - 1);
    }

    // Check today
    const todayKey = fmtDate(new Date());
    const todayDow = (new Date().getDay() + 6) % 7;
    if (habit.days.includes(todayDow) && logs[todayKey]?.[habit.id]) {
      streak++;
    }

    return streak;
  };

  const weekLabel = `${dates[0].toLocaleDateString('en', { month: 'short', day: 'numeric' })} — ${dates[6].toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="font-semibold text-gray-700">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Habits Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
                Habit
              </th>
              {dates.map((d, i) => (
                <th
                  key={i}
                  className={`text-center px-2 py-3 text-xs font-semibold uppercase tracking-wider ${
                    isToday(d) ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {DAY_NAMES[i]}
                  <br />
                  <span className="font-normal">{d.getDate()}</span>
                </th>
              ))}
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                🔥
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              let weekDone = 0;
              let weekTarget = 0;

              return (
                <tr key={habit.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{habit.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800">{habit.name}</div>
                        <div className="text-xs text-gray-400">
                          {habit.freq === 'daily'
                            ? 'Daily'
                            : habit.freq === 'weekdays'
                            ? 'Mon-Fri'
                            : habit.days.map((d) => DAY_NAMES[d].slice(0, 2)).join('/')}
                        </div>
                      </div>
                    </div>
                  </td>
                  {dates.map((d, i) => {
                    const key = fmtDate(d);
                    const dow = (d.getDay() + 6) % 7;
                    const applicable = habit.days.includes(dow);
                    if (applicable) weekTarget++;
                    const done = logs[key]?.[habit.id];
                    if (done && applicable) weekDone++;

                    if (!applicable) {
                      return (
                        <td key={i} className="text-center px-2 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-400 text-xs">
                            —
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={i} className="text-center px-2 py-3">
                        <button
                          onClick={() => toggleHabit(habit.id, key)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all ${
                            done
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'bg-white border-gray-200 hover:border-blue-400'
                          }`}
                        >
                          {done && '✓'}
                        </button>
                      </td>
                    );
                  })}
                  <td className="text-center px-3 py-3">
                    <span className="inline-flex items-center gap-1 text-yellow-500 font-semibold text-sm">
                      <Flame size={14} />
                      {getStreak(habit)}
                    </span>
                  </td>
                  <td className="text-center px-3 py-3">
                    {(() => {
                      const pct = weekTarget > 0 ? Math.round((weekDone / weekTarget) * 100) : 0;
                      const colorClass =
                        pct >= 80 ? 'text-green-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500';
                      return <span className={`font-medium text-sm ${colorClass}`}>{pct}%</span>;
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
