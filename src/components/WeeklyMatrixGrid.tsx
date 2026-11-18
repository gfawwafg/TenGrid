import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Moon,
  Plus,
  RotateCcw,
  CalendarPlus,
  X,
} from 'lucide-react';
import { CellEntry, PunishmentRecord, RoutineSlot, TaskStatus } from '../types/routine';
import { DayMeta, formatWeekRange } from '../utils/dates';

interface WeeklyMatrixGridProps {
  weekOffset: number;
  days: DayMeta[];
  routineSlots: RoutineSlot[];
  cellsByDate: Record<string, Record<number, CellEntry>>;
  punishments: PunishmentRecord[];
  onChangeWeek: (delta: number) => void;
  onJumpToday: () => void;
  onOpenCell: (dateKey: string, slotIndex: number) => void;
  onClearWeek: (dateKeys: string[]) => void;
  onJumpToRoutine: () => void;
}

export const WeeklyMatrixGrid: React.FC<WeeklyMatrixGridProps> = ({
  weekOffset,
  days,
  routineSlots,
  cellsByDate,
  punishments,
  onChangeWeek,
  onJumpToday,
  onOpenCell,
  onClearWeek,
  onJumpToRoutine,
}) => {
  const [mobileMode, setMobileMode] = useState<'compact' | 'detailed'>('compact');
  const [confirmClear, setConfirmClear] = useState(false);

  const punishmentById = useMemo(() => {
    const map = new Map<string, PunishmentRecord>();
    for (const p of punishments) {
      map.set(p.id, p);
    }
    return map;
  }, [punishments]);

  const carryoversByTargetDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of punishments) {
      if (!p.resolved) {
        map.set(p.targetDate, (map.get(p.targetDate) ?? 0) + 1);
      }
    }
    return map;
  }, [punishments]);

  const stats = useMemo(() => {
    let done = 0;
    let partial = 0;
    let missed = 0;
    let pending = 0;
    const weekDateSet = new Set(days.map((d) => d.dateKey));

    for (const d of days) {
      const dayCells = cellsByDate[d.dateKey] ?? {};
      for (let s = 0; s < 10; s++) {
        const status: TaskStatus = dayCells[s]?.status ?? 'pending';
        if (status === 'done') done++;
        else if (status === 'partial') partial++;
        else if (status === 'missed') missed++;
        else pending++;
      }
    }

    const activePenalties = punishments.filter(
      (p) => !p.resolved && (weekDateSet.has(p.sourceDate) || weekDateSet.has(p.targetDate))
    ).length;

    const totalLogged = done + partial + missed;
    const score = totalLogged > 0 ? Math.round(((done + partial * 0.5) / 70) * 100) : 0;

    return { done, partial, missed, pending, activePenalties, score };
  }, [days, cellsByDate, punishments]);

  return (
    <section aria-label="Weekly 7 by 10 routine matrix" className="space-y-4">
      {/* Week Controls & Legend */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1">
            <button
              type="button"
              onClick={() => onChangeWeek(-1)}
              aria-label="Previous week"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap tabular-nums">
              {formatWeekRange(days)}
            </span>
            <button
              type="button"
              onClick={() => onChangeWeek(1)}
              aria-label="Next week"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={onJumpToday}
              className="min-h-[40px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 whitespace-nowrap shrink-0"
            >
              This Week
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Mobile Compact / Detailed Switcher */}
          <div className="sm:hidden flex items-center p-1 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/80">
            <button
              type="button"
              onClick={() => setMobileMode('compact')}
              className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                mobileMode === 'compact'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              7×10 Fit
            </button>
            <button
              type="button"
              onClick={() => setMobileMode('detailed')}
              className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                mobileMode === 'detailed'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Detailed
            </button>
          </div>

          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="min-h-[40px] flex items-center gap-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Week</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onClearWeek(days.map((d) => d.dateKey));
                  setConfirmClear(false);
                }}
                className="min-h-[40px] px-3 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 whitespace-nowrap"
              >
                Confirm Clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="min-h-[40px] px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unboxed Clean Summary Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono tabular-nums">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" aria-hidden="true" />
            {stats.done} Done
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block" aria-hidden="true" />
            {stats.partial} Partial
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-600 inline-block" aria-hidden="true" />
            {stats.missed} Missed
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-zinc-700 dark:text-zinc-300">
            {stats.activePenalties} Active Penalties
          </span>
        </div>
        <div className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
          {stats.score}% Weekly Completion
        </div>
      </div>

      {/* The 7x10 Routine Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className={mobileMode === 'detailed' ? 'overflow-x-auto' : 'overflow-x-auto sm:overflow-x-visible'}>
          <div className={mobileMode === 'detailed' ? 'min-w-[680px]' : 'w-full'}>
            {/* Column Headers (Routine Slot + 7 Days) */}
            <div className="grid grid-cols-[88px_repeat(7,minmax(0,1fr))] sm:grid-cols-[175px_repeat(7,minmax(0,1fr))] lg:grid-cols-[225px_repeat(7,minmax(0,1fr))] border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/60">
              <button
                type="button"
                onClick={onJumpToRoutine}
                className="p-2 sm:px-3.5 sm:py-3 text-left flex flex-col justify-center border-r border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <span className="text-[11px] sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  10 Cells / Day
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  Tap to edit routine
                </span>
              </button>

              {days.map((day) => {
                const penaltyCount = carryoversByTargetDate.get(day.dateKey) ?? 0;
                return (
                  <div
                    key={day.dateKey}
                    className={`py-2 px-0.5 sm:px-2 flex flex-col items-center justify-center border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 ${
                      day.isToday
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                        : ''
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-semibold sm:hidden">
                      {day.dayShort}
                    </span>
                    <span className="hidden sm:inline text-xs font-semibold">
                      {day.dayMed}
                    </span>
                    <span
                      className={`text-[11px] sm:text-xs font-mono tabular-nums ${
                        day.isToday
                          ? 'text-zinc-200 dark:text-zinc-700 font-bold'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {day.dayNum}
                    </span>
                    {penaltyCount > 0 && (
                      <span
                        className={`mt-0.5 text-[9px] sm:text-[10px] font-mono tabular-nums font-bold ${
                          day.isToday
                            ? 'text-red-300 dark:text-red-600'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                        title={`${penaltyCount} penalty due`}
                      >
                        +{penaltyCount}P
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 10 Routine Rows */}
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {routineSlots.map((slot) => (
                <div
                  key={slot.slotIndex}
                  className="grid grid-cols-[88px_repeat(7,minmax(0,1fr))] sm:grid-cols-[175px_repeat(7,minmax(0,1fr))] lg:grid-cols-[225px_repeat(7,minmax(0,1fr))] items-stretch"
                >
                  {/* Left Row Label */}
                  <button
                    type="button"
                    onClick={onJumpToRoutine}
                    className="px-2 py-1.5 sm:px-3.5 sm:py-2.5 text-left flex flex-col justify-center border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors min-h-[48px] sm:min-h-[54px]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-mono tabular-nums text-zinc-400 dark:text-zinc-500 shrink-0">
                        {String(slot.slotIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {slot.title}
                      </span>
                    </div>
                    {slot.timeLabel && (
                      <span className="hidden sm:block text-[11px] font-mono tabular-nums text-zinc-400 dark:text-zinc-500 pl-5 mt-0.5">
                        {slot.timeLabel} · {slot.category}
                      </span>
                    )}
                  </button>

                  {/* 7 Day Cells for this Slot */}
                  {days.map((day) => {
                    const entry = cellsByDate[day.dateKey]?.[slot.slotIndex];
                    const status: TaskStatus = entry?.status ?? 'pending';
                    const punishment = entry?.punishmentId
                      ? punishmentById.get(entry.punishmentId)
                      : undefined;
                    const customTitle = entry?.customTitle?.trim();

                    let cellClasses =
                      'bg-zinc-50/70 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/60';
                    if (status === 'done') {
                      cellClasses =
                        'bg-emerald-600 hover:bg-emerald-700 text-white';
                    } else if (status === 'partial') {
                      cellClasses =
                        'bg-amber-400 hover:bg-amber-500 text-zinc-950';
                    } else if (status === 'missed') {
                      cellClasses =
                        'bg-red-600 hover:bg-red-700 text-white';
                    }

                    return (
                      <div
                        key={`${day.dateKey}-${slot.slotIndex}`}
                        className={`p-1 sm:p-1.5 border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 flex items-stretch ${
                          day.isToday ? 'bg-zinc-100/60 dark:bg-zinc-800/30' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenCell(day.dateKey, slot.slotIndex)}
                          aria-label={`${day.dayFull} ${day.monthShort} ${day.dayNum}, Slot ${
                            slot.slotIndex + 1
                          }: ${customTitle || slot.title}, status ${status}`}
                          className={`relative w-full min-h-[44px] sm:min-h-[48px] rounded-lg px-1 sm:px-2 py-1 flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${cellClasses}`}
                        >
                          {status === 'pending' && (
                            <>
                              <Plus className="w-3.5 h-3.5 opacity-45" />
                              {customTitle && (
                                <span className="hidden lg:block text-[10px] text-zinc-600 dark:text-zinc-300 truncate max-w-full">
                                  {customTitle}
                                </span>
                              )}
                            </>
                          )}

                          {status === 'done' && (
                            <>
                              <Check className="w-4 h-4 shrink-0" strokeWidth={2.75} />
                              <span
                                className={`${
                                  mobileMode === 'detailed' ? 'block' : 'hidden lg:block'
                                } text-[10px] font-semibold leading-none truncate max-w-full`}
                              >
                                {customTitle || 'Done'}
                              </span>
                            </>
                          )}

                          {status === 'partial' && (
                            <>
                              <Clock className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                              <span
                                className={`${
                                  mobileMode === 'detailed' ? 'block' : 'hidden lg:block'
                                } text-[10px] font-semibold leading-none truncate max-w-full`}
                              >
                                {entry?.partialNote || 'Partial'}
                              </span>
                            </>
                          )}

                          {status === 'missed' && (
                            <>
                              <div className="flex items-center gap-0.5">
                                {punishment?.resolved ? (
                                  <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.75} />
                                ) : (
                                  <X className="w-3.5 h-3.5 shrink-0" strokeWidth={2.75} />
                                )}
                                {punishment && (
                                  <span className="text-[9px] sm:text-[10px] font-mono font-bold leading-none">
                                    {punishment.mode === 'night' ? 'N' : 'T'}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`${
                                  mobileMode === 'detailed' ? 'block' : 'hidden lg:block'
                                } text-[10px] font-semibold leading-none truncate max-w-full`}
                              >
                                {punishment
                                  ? punishment.resolved
                                    ? 'Paid'
                                    : punishment.mode === 'night'
                                    ? 'Night'
                                    : 'Tmrw'
                                  : 'Missed'}
                              </span>
                            </>
                          )}

                          {/* Tiny indicator if task was customized for this single day */}
                          {customTitle && (
                            <span
                              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-current opacity-60"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Punishment Legend Footer */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 px-1">
        <span className="inline-flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
          <span>
            <strong className="font-mono text-zinc-800 dark:text-zinc-200">N</strong> = Stay Up Tonight punishment
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarPlus className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
          <span>
            <strong className="font-mono text-zinc-800 dark:text-zinc-200">T</strong> = Do Tomorrow punishment
          </span>
        </span>
      </div>
    </section>
  );
};
