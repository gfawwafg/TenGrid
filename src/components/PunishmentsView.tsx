import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  CalendarPlus,
  Check,
  Moon,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { PunishmentMode, PunishmentRecord } from '../types/routine';
import { formatReadableDate } from '../utils/dates';

interface PunishmentsViewProps {
  punishments: PunishmentRecord[];
  onToggleResolved: (punishmentId: string) => void;
  onSwitchMode: (punishmentId: string, mode: PunishmentMode) => void;
}

export const PunishmentsView: React.FC<PunishmentsViewProps> = ({
  punishments,
  onToggleResolved,
  onSwitchMode,
}) => {
  const [presetMinutes, setPresetMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const selectPreset = (mins: number) => {
    setTimerRunning(false);
    setPresetMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const { nightActive, tomorrowActive, resolvedList } = useMemo(() => {
    const night = punishments.filter((p) => !p.resolved && p.mode === 'night');
    const tomorrow = punishments.filter((p) => !p.resolved && p.mode === 'tomorrow');
    const resolved = punishments.filter((p) => p.resolved);
    return { nightActive: night, tomorrowActive: tomorrow, resolvedList: resolved };
  }, [punishments]);

  return (
    <section aria-label="Punishment tracker and night shift" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Punishment Ledger
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Missed tasks require staying up tonight or carrying over tomorrow
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
          {nightActive.length} Night · {tomorrowActive.length} Tomorrow · {resolvedList.length} Paid
        </div>
      </div>

      {/* Night Shift Timer Card */}
      <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Moon className="w-4 h-4 text-red-400" />
              <span>Night Shift Focus Timer</span>
            </div>
            <div className="mt-1 text-4xl font-bold font-mono tabular-nums tracking-tight">
              {formatTimer(secondsLeft)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[15, 25, 45].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => selectPreset(mins)}
                className={`min-h-[40px] px-3 rounded-xl text-xs font-mono font-semibold transition-colors ${
                  presetMinutes === mins
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {mins}m
              </button>
            ))}

            <button
              type="button"
              onClick={() => setTimerRunning((r) => !r)}
              className="min-h-[44px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{timerRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setSecondsLeft(presetMinutes * 60);
              }}
              aria-label="Reset timer"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stay Up Tonight Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Moon className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>Stay Up Tonight ({nightActive.length})</span>
          </h3>
        </div>

        {nightActive.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No active night punishments. Keep your evening clean.
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {nightActive.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-mono tabular-nums text-red-600 dark:text-red-400 font-semibold">
                    Slot {String(item.slotIndex + 1).padStart(2, '0')} · Missed {formatReadableDate(item.sourceDate)}
                  </div>
                  <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                    {item.taskTitle}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Must finish tonight before sleep
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSwitchMode(item.id, 'tomorrow')}
                    className="min-h-[44px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Move Tomorrow</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleResolved(item.id)}
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Done Tonight</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tomorrow Carryover Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarPlus className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>Do Tomorrow Carryovers ({tomorrowActive.length})</span>
          </h3>
        </div>

        {tomorrowActive.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No carryover tasks queued for tomorrow.
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {tomorrowActive.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-mono tabular-nums text-red-600 dark:text-red-400 font-semibold">
                    Due {formatReadableDate(item.targetDate)} · Missed {formatReadableDate(item.sourceDate)}
                  </div>
                  <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                    {item.taskTitle}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Mandatory double-load carryover task
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSwitchMode(item.id, 'night')}
                    className="min-h-[44px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Do Tonight</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleResolved(item.id)}
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Complete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paid Penalties History */}
      {resolvedList.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 px-1">
            Paid Penalties ({resolvedList.length})
          </h3>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {resolvedList.slice(0, 10).map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 line-through truncate">
                    {item.taskTitle}
                  </div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                    {item.mode === 'night' ? 'Completed at night' : 'Completed carryover'} ·{' '}
                    {formatReadableDate(item.sourceDate)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleResolved(item.id)}
                  className="min-h-[40px] px-3 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
