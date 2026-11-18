import React, { useMemo } from 'react';
import {
  AlertTriangle,
  CalendarPlus,
  Check,
  Clock,
  Moon,
  X,
} from 'lucide-react';
import { CellEntry, PunishmentRecord, RoutineSlot, TaskStatus } from '../types/routine';
import { DayMeta, formatReadableDate } from '../utils/dates';

interface TodayFocusViewProps {
  days: DayMeta[];
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  routineSlots: RoutineSlot[];
  cellsByDate: Record<string, Record<number, CellEntry>>;
  punishments: PunishmentRecord[];
  onQuickStatus: (dateKey: string, slotIndex: number, status: TaskStatus) => void;
  onOpenCell: (dateKey: string, slotIndex: number, initialStep?: 'status' | 'punishment') => void;
  onTogglePunishmentResolved: (punishmentId: string) => void;
}

export const TodayFocusView: React.FC<TodayFocusViewProps> = ({
  days,
  selectedDateKey,
  onSelectDateKey,
  routineSlots,
  cellsByDate,
  punishments,
  onQuickStatus,
  onOpenCell,
  onTogglePunishmentResolved,
}) => {
  const selectedDay = days.find((d) => d.dateKey === selectedDateKey) ?? days[0];
  const dayCells = cellsByDate[selectedDay.dateKey] ?? {};

  const penaltiesDueOnDay = useMemo(
    () =>
      punishments.filter(
        (p) => p.targetDate === selectedDay.dateKey
      ),
    [punishments, selectedDay.dateKey]
  );

  const summary = useMemo(() => {
    let done = 0;
    let partial = 0;
    let missed = 0;
    for (let i = 0; i < 10; i++) {
      const s = dayCells[i]?.status ?? 'pending';
      if (s === 'done') done++;
      else if (s === 'partial') partial++;
      else if (s === 'missed') missed++;
    }
    return { done, partial, missed, remaining: 10 - done - partial - missed };
  }, [dayCells]);

  return (
    <section aria-label="Daily 10-cell checklist" className="space-y-5">
      {/* Horizontal 7-Day Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {days.map((day) => {
          const active = day.dateKey === selectedDay.dateKey;
          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDateKey(day.dateKey)}
              className={`min-h-[56px] min-w-[48px] flex-1 flex flex-col items-center justify-center rounded-2xl px-2 py-2 transition-colors shrink-0 ${
                active
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="text-[11px] font-medium opacity-80">{day.dayMed}</span>
              <span className="text-sm font-bold font-mono tabular-nums mt-0.5">
                {day.dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Header & Compact Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {selectedDay.dayFull} · {selectedDay.monthShort} {selectedDay.dayNum}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {formatReadableDate(selectedDay.dateKey)} · 10 routine cells
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            {summary.done}/10 Done
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-amber-700 dark:text-amber-400 font-semibold">
            {summary.partial} Partial
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-red-700 dark:text-red-400 font-semibold">
            {summary.missed} Missed
          </span>
        </div>
      </div>

      {/* Active Punishments Due on This Day */}
      {penaltiesDueOnDay.length > 0 && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/70 bg-red-50/70 dark:bg-red-950/30 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <h3 className="text-sm font-bold">
                Punishments Due ({penaltiesDueOnDay.filter((p) => !p.resolved).length} remaining)
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            {penaltiesDueOnDay.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-zinc-900 border border-red-200/80 dark:border-red-900/50 p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      p.resolved
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {p.mode === 'night' ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <CalendarPlus className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-sm font-semibold truncate ${
                        p.resolved
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {p.taskTitle}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {p.mode === 'night'
                        ? 'Stay up tonight before sleep'
                        : `Carried over from ${formatReadableDate(p.sourceDate)}`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePunishmentResolved(p.id)}
                  className={`min-h-[44px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    p.resolved
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                  }`}
                >
                  {p.resolved ? 'Paid' : 'Complete'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10 Routine Cells Touch List */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
        {routineSlots.map((slot) => {
          const entry = dayCells[slot.slotIndex];
          const status: TaskStatus = entry?.status ?? 'pending';
          const effectiveTitle = entry?.customTitle?.trim() || slot.title;
          const effectiveTime =
            entry?.customTime !== undefined ? entry.customTime : slot.timeLabel;

          let rowAccent = '';
          if (status === 'done') {
            rowAccent = 'bg-emerald-50/60 dark:bg-emerald-950/20';
          } else if (status === 'partial') {
            rowAccent = 'bg-amber-50/60 dark:bg-amber-950/20';
          } else if (status === 'missed') {
            rowAccent = 'bg-red-50/60 dark:bg-red-950/20';
          }

          return (
            <div
              key={slot.slotIndex}
              className={`flex items-center justify-between gap-2 p-3 sm:px-4 min-h-[64px] transition-colors ${rowAccent}`}
            >
              <button
                type="button"
                onClick={() => onOpenCell(selectedDay.dateKey, slot.slotIndex, 'status')}
                className="flex-1 min-w-0 text-left py-1 pr-2 focus-visible:outline-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tabular-nums text-zinc-400 dark:text-zinc-500 shrink-0">
                    {String(slot.slotIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {effectiveTitle}
                  </span>
                </div>
                <div className="mt-0.5 pl-6 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {effectiveTime ? `${effectiveTime} · ` : ''}
                  {status === 'pending' && 'Tap to log or edit'}
                  {status === 'done' && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      Done (Green)
                    </span>
                  )}
                  {status === 'partial' && (
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      Partial (Yellow){entry?.partialNote ? ` · ${entry.partialNote}` : ''}
                    </span>
                  )}
                  {status === 'missed' && (
                    <span className="text-red-700 dark:text-red-400 font-medium">
                      Missed (Red)
                    </span>
                  )}
                </div>
              </button>

              {/* 1-Tap Thumb Status Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onQuickStatus(
                      selectedDay.dateKey,
                      slot.slotIndex,
                      status === 'done' ? 'pending' : 'done'
                    )
                  }
                  aria-label={`Mark ${effectiveTitle} done`}
                  className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-colors ${
                    status === 'done'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700'
                  }`}
                >
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onQuickStatus(
                      selectedDay.dateKey,
                      slot.slotIndex,
                      status === 'partial' ? 'pending' : 'partial'
                    )
                  }
                  aria-label={`Mark ${effectiveTitle} partial`}
                  className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-colors ${
                    status === 'partial'
                      ? 'bg-amber-400 text-zinc-950'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-amber-100 dark:hover:bg-amber-950 hover:text-amber-700'
                  }`}
                >
                  <Clock className="w-5 h-5" strokeWidth={2.25} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onOpenCell(selectedDay.dateKey, slot.slotIndex, 'punishment')
                  }
                  aria-label={`Mark ${effectiveTitle} missed and choose punishment`}
                  className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-colors ${
                    status === 'missed'
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-700'
                  }`}
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
