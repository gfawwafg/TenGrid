import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckSquare,
  Grid3X3,
  ListTodo,
  Moon,
  Sun,
  CalendarPlus,
} from 'lucide-react';
import { CellActionSheet } from './components/CellActionSheet';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PunishmentsView } from './components/PunishmentsView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { RoutineBuilderView } from './components/RoutineBuilderView';
import { TodayFocusView } from './components/TodayFocusView';
import { WeeklyMatrixGrid } from './components/WeeklyMatrixGrid';
import { useRoutineStore } from './hooks/useRoutineStore';
import { PunishmentMode, TaskStatus } from './types/routine';
import { formatReadableDate, getLocalDateKey, getWeekDays } from './utils/dates';

type TabKey = 'grid' | 'today' | 'penalties' | 'routine';

interface ActiveCellTarget {
  dateKey: string;
  slotIndex: number;
  initialStep: 'status' | 'punishment';
}

export default function App() {
  const {
    state,
    toggleTheme,
    getCell,
    getEffectiveTask,
    setCellStatus,
    updateCellCustomTask,
    togglePunishmentResolved,
    switchPunishmentMode,
    updateRoutineSlot,
    applyRoutinePreset,
    clearWeekCells,
    importStateJson,
  } = useRoutineStore();

  const [activeTab, setActiveTab] = useState<TabKey>('grid');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => getLocalDateKey(new Date()));
  const [cellSheetTarget, setCellSheetTarget] = useState<ActiveCellTarget | null>(null);

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  const activePunishments = useMemo(
    () => state.punishments.filter((p) => !p.resolved),
    [state.punishments]
  );

  const todayKey = getLocalDateKey(new Date());
  const todayCells = state.cellsByDate[todayKey] ?? {};
  const todayDoneCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 10; i++) {
      if (todayCells[i]?.status === 'done') count++;
    }
    return count;
  }, [todayCells]);

  const handleChangeWeek = (delta: number) => {
    const nextOffset = weekOffset + delta;
    setWeekOffset(nextOffset);
    const nextDays = getWeekDays(nextOffset);
    if (!nextDays.some((d) => d.dateKey === selectedDayKey)) {
      setSelectedDayKey(nextDays[0].dateKey);
    }
  };

  const handleJumpToday = () => {
    setWeekOffset(0);
    setSelectedDayKey(getLocalDateKey(new Date()));
  };

  const handleOpenCell = (
    dateKey: string,
    slotIndex: number,
    initialStep: 'status' | 'punishment' = 'status'
  ) => {
    setCellSheetTarget({ dateKey, slotIndex, initialStep });
  };

  const handleQuickStatus = (dateKey: string, slotIndex: number, status: TaskStatus) => {
    if (status === 'missed') {
      handleOpenCell(dateKey, slotIndex, 'punishment');
      return;
    }
    setCellStatus(dateKey, slotIndex, status);
  };

  const sheetDayMeta = cellSheetTarget
    ? weekDays.find((d) => d.dateKey === cellSheetTarget.dateKey)
    : undefined;
  const sheetEffectiveTask = cellSheetTarget
    ? getEffectiveTask(cellSheetTarget.dateKey, cellSheetTarget.slotIndex)
    : undefined;
  const sheetEntry = cellSheetTarget
    ? getCell(cellSheetTarget.dateKey, cellSheetTarget.slotIndex)
    : undefined;
  const sheetPunishment = sheetEntry?.punishmentId
    ? state.punishments.find((p) => p.id === sheetEntry.punishmentId)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top Bar — 3-Zone Contract on Desktop, Compact Mobile Bar <= 48px */}
      <header className="sticky top-0 z-30 h-12 md:h-16 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Single Text Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('grid')}
            className="text-base md:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0"
          >
            TenGrid
          </button>

          {/* Zone 2: 4 Clean Single-Line Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'grid'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Weekly Grid
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'today'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('penalties')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'penalties'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Penalties{activePunishments.length > 0 ? ` (${activePunishments.length})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('routine')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'routine'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Routine
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {state.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <PWAInstallButton variant="compact" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-6 py-4 sm:py-6 pb-20 md:pb-10">
        {activeTab === 'grid' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-9 min-w-0">
              <WeeklyMatrixGrid
                weekOffset={weekOffset}
                days={weekDays}
                routineSlots={state.routineSlots}
                cellsByDate={state.cellsByDate}
                punishments={state.punishments}
                onChangeWeek={handleChangeWeek}
                onJumpToday={handleJumpToday}
                onOpenCell={(dk, idx) => handleOpenCell(dk, idx, 'status')}
                onClearWeek={clearWeekCells}
                onJumpToRoutine={() => setActiveTab('routine')}
              />
            </div>

            {/* Desktop Accountability Side Rail */}
            <aside className="hidden xl:block xl:col-span-3 space-y-4">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Today&apos;s Focus
                  </h2>
                  <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                    {todayDoneCount}/10
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tap any cell in the 7×10 table to mark Green, Yellow, or Red, or switch to Today for rapid 1-tap logging.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDayKey(todayKey);
                    setActiveTab('today');
                  }}
                  className="w-full min-h-[44px] rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Open Today&apos;s 10 Tasks
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>Active Penalties</span>
                  </h2>
                  <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                    {activePunishments.length}
                  </span>
                </div>

                {activePunishments.length === 0 ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Zero owed punishments. Keep every cell green or yellow.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activePunishments.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {p.taskTitle}
                          </div>
                          <div className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1 mt-0.5">
                            {p.mode === 'night' ? (
                              <>
                                <Moon className="w-3 h-3 shrink-0" />
                                <span>Stay up tonight</span>
                              </>
                            ) : (
                              <>
                                <CalendarPlus className="w-3 h-3 shrink-0" />
                                <span>Due {formatReadableDate(p.targetDate)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePunishmentResolved(p.id)}
                          aria-label={`Complete penalty ${p.taskTitle}`}
                          className="min-h-[36px] min-w-[36px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {activePunishments.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('penalties')}
                        className="w-full py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:underline"
                      >
                        View all {activePunishments.length} penalties
                      </button>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'today' && (
          <div className="max-w-3xl mx-auto">
            <TodayFocusView
              days={weekDays}
              selectedDateKey={selectedDayKey}
              onSelectDateKey={setSelectedDayKey}
              routineSlots={state.routineSlots}
              cellsByDate={state.cellsByDate}
              punishments={state.punishments}
              onQuickStatus={handleQuickStatus}
              onOpenCell={handleOpenCell}
              onTogglePunishmentResolved={togglePunishmentResolved}
            />
          </div>
        )}

        {activeTab === 'penalties' && (
          <div className="max-w-3xl mx-auto">
            <PunishmentsView
              punishments={state.punishments}
              onToggleResolved={togglePunishmentResolved}
              onSwitchMode={switchPunishmentMode}
            />
          </div>
        )}

        {activeTab === 'routine' && (
          <div className="max-w-3xl mx-auto">
            <RoutineBuilderView
              routineSlots={state.routineSlots}
              theme={state.theme}
              fullState={state}
              onUpdateSlot={updateRoutineSlot}
              onApplyPreset={applyRoutinePreset}
              onToggleTheme={toggleTheme}
              onImportState={importStateJson}
            />
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar — Thumb Zone (<= 56px + safe area) */}
      <nav
        aria-label="Primary mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-safe"
      >
        <div className="grid grid-cols-4 h-14 items-center">
          <button
            type="button"
            onClick={() => setActiveTab('grid')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'grid'
                ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <Grid3X3 className="w-5 h-5" strokeWidth={activeTab === 'grid' ? 2.4 : 1.9} />
            <span className="text-[10px] tracking-tight">Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'today'
                ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <CheckSquare className="w-5 h-5" strokeWidth={activeTab === 'today' ? 2.4 : 1.9} />
            <span className="text-[10px] tracking-tight">Today</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('penalties')}
            className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'penalties'
                ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <div className="relative">
              <CalendarDays
                className="w-5 h-5"
                strokeWidth={activeTab === 'penalties' ? 2.4 : 1.9}
              />
              {activePunishments.length > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {activePunishments.length}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Penalties</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('routine')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === 'routine'
                ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <ListTodo className="w-5 h-5" strokeWidth={activeTab === 'routine' ? 2.4 : 1.9} />
            <span className="text-[10px] tracking-tight">Routine</span>
          </button>
        </div>
      </nav>

      {/* Cell Status & Punishment Bottom Sheet */}
      {cellSheetTarget && sheetEffectiveTask && (
        <CellActionSheet
          isOpen={true}
          dateKey={cellSheetTarget.dateKey}
          dayFull={sheetDayMeta?.dayFull ?? formatReadableDate(cellSheetTarget.dateKey)}
          slotIndex={cellSheetTarget.slotIndex}
          taskTitle={sheetEffectiveTask.title}
          taskTime={sheetEffectiveTask.timeLabel}
          category={sheetEffectiveTask.category}
          entry={sheetEntry}
          linkedPunishment={sheetPunishment}
          initialStep={cellSheetTarget.initialStep}
          onClose={() => setCellSheetTarget(null)}
          onSelectStatus={(status, opts?: { partialNote?: string; punishmentMode?: PunishmentMode }) =>
            setCellStatus(cellSheetTarget.dateKey, cellSheetTarget.slotIndex, status, opts)
          }
          onUpdateCustomTask={(title, time) =>
            updateCellCustomTask(cellSheetTarget.dateKey, cellSheetTarget.slotIndex, title, time)
          }
          onTogglePunishmentResolved={togglePunishmentResolved}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}
