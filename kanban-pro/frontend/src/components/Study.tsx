// Study plan component

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { studyApi, type StudyPhase, type StudyStats } from '../api/client';

export function Study() {
  const [phases, setPhases] = useState<StudyPhase[]>([]);
  const [stats, setStats] = useState<StudyStats>({ total: 0, completed: 0, percent: 0 });
  const [openPhases, setOpenPhases] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [phasesData, statsData] = await Promise.all([
          studyApi.list(),
          studyApi.getStats(),
        ]);
        setPhases(phasesData);
        setStats(statsData);
        // Open first phase by default
        if (phasesData.length > 0) {
          setOpenPhases(new Set([phasesData[0].id]));
        }
      } catch (err) {
        console.error('Failed to load study plan:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const togglePhase = (phaseId: string) => {
    setOpenPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const toggleTopic = async (topicId: string) => {
    try {
      const updated = await studyApi.toggleTopic(topicId);
      
      // Update local state
      setPhases((prev) =>
        prev.map((phase) => ({
          ...phase,
          weeks: phase.weeks.map((week) => ({
            ...week,
            topics: week.topics.map((topic) =>
              topic.id === topicId ? { ...topic, completed: updated.completed } : topic
            ),
          })),
        }))
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        completed: updated.completed ? prev.completed + 1 : prev.completed - 1,
        percent: Math.round(
          ((updated.completed ? prev.completed + 1 : prev.completed - 1) / prev.total) * 100
        ),
      }));
    } catch (err) {
      console.error('Failed to toggle topic:', err);
    }
  };

  const getPhaseProgress = (phase: StudyPhase) => {
    let total = 0;
    let completed = 0;
    for (const week of phase.weeks) {
      for (const topic of week.topics) {
        total++;
        if (topic.completed) completed++;
      }
    }
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading study plan...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            📚 Study Plan — Road to July 2026
          </h2>
          <p className="text-sm text-gray-500">
            DiffEq + Multivariate Stats (ENES Morelia) · Norwegian B1 · Stein på stein
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.percent}%</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Overall</div>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const progress = getPhaseProgress(phase);
          const isOpen = openPhases.has(phase.id);

          return (
            <div
              key={phase.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{phase.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800">{phase.name}</div>
                    {phase.description && (
                      <div className="text-sm text-gray-500">{phase.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right">{progress.percent}%</span>
                  <ChevronRight
                    size={18}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  />
                </div>
              </button>

              {/* Phase Body (weeks) */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {phase.weeks.map((week) => (
                    <div key={week.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-800">{week.title}</div>
                        {week.source && (
                          <div className="text-xs text-gray-400 italic">{week.source}</div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {week.topics.map((topic) => (
                          <div
                            key={topic.id}
                            className="flex items-center gap-2 group"
                          >
                            <button
                              onClick={() => toggleTopic(topic.id)}
                              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center text-xs transition-all ${
                                topic.completed
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-blue-400'
                              }`}
                            >
                              {topic.completed && '✓'}
                            </button>
                            <span
                              className={`text-sm ${
                                topic.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                              }`}
                            >
                              {topic.text}
                            </span>
                            {topic.examTag && (
                              <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                EXAM
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
