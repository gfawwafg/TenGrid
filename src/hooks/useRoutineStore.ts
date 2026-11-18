import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  CellEntry,
  PunishmentMode,
  PunishmentRecord,
  RoutineSlot,
  TaskStatus,
} from '../types/routine';
import { addDaysToKey } from '../utils/dates';

const STORAGE_KEY = 'tengrid_routine_state_v1';

export const DEFAULT_SLOTS: RoutineSlot[] = [
  { slotIndex: 0, title: 'Wake & Hydrate', timeLabel: '06:30', category: 'Health' },
  { slotIndex: 1, title: 'Morning Workout', timeLabel: '07:00', category: 'Fitness' },
  { slotIndex: 2, title: 'Deep Work Block 1', timeLabel: '09:00', category: 'Focus' },
  { slotIndex: 3, title: 'Skill / Study Session', timeLabel: '11:30', category: 'Study' },
  { slotIndex: 4, title: 'Clean Lunch & Walk', timeLabel: '13:00', category: 'Health' },
  { slotIndex: 5, title: 'Deep Work Block 2', timeLabel: '14:30', category: 'Focus' },
  { slotIndex: 6, title: 'Errands & Inbox Zero', timeLabel: '17:30', category: 'Admin' },
  { slotIndex: 7, title: 'Evening Reading', timeLabel: '19:30', category: 'Study' },
  { slotIndex: 8, title: 'Tidy Room & Prep', timeLabel: '21:00', category: 'Home' },
  { slotIndex: 9, title: 'Screens Off & Sleep', timeLabel: '22:30', category: 'Rest' },
];

export const ROUTINE_PRESETS: Record<string, RoutineSlot[]> = {
  balanced: DEFAULT_SLOTS,
  student: [
    { slotIndex: 0, title: 'Wake & Make Bed', timeLabel: '07:00', category: 'Home' },
    { slotIndex: 1, title: 'Morning Run / Stretch', timeLabel: '07:30', category: 'Fitness' },
    { slotIndex: 2, title: 'Lecture / Class Notes', timeLabel: '09:00', category: 'Study' },
    { slotIndex: 3, title: 'Problem Sets Block', timeLabel: '11:00', category: 'Study' },
    { slotIndex: 4, title: 'Healthy Meal & Break', timeLabel: '13:00', category: 'Health' },
    { slotIndex: 5, title: 'Project / Lab Work', timeLabel: '14:30', category: 'Focus' },
    { slotIndex: 6, title: 'Flashcards / Review', timeLabel: '17:00', category: 'Study' },
    { slotIndex: 7, title: 'Gym / Strength', timeLabel: '18:30', category: 'Fitness' },
    { slotIndex: 8, title: 'Pack Bag for Tomorrow', timeLabel: '21:00', category: 'Home' },
    { slotIndex: 9, title: 'Sleep by 22:30', timeLabel: '22:30', category: 'Rest' },
  ],
  blank: Array.from({ length: 10 }, (_, idx) => ({
    slotIndex: idx,
    title: `Routine Task ${idx + 1}`,
    timeLabel: '',
    category: 'Routine',
  })),
};

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      if (Array.isArray(parsed.routineSlots) && parsed.routineSlots.length === 10) {
        return {
          routineSlots: parsed.routineSlots,
          cellsByDate: parsed.cellsByDate ?? {},
          punishments: Array.isArray(parsed.punishments) ? parsed.punishments : [],
          theme: parsed.theme === 'dark' ? 'dark' : 'light',
        };
      }
    }
  } catch {
    // Fallback to clean initial state
  }

  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    routineSlots: DEFAULT_SLOTS,
    cellsByDate: {},
    punishments: [],
    theme: prefersDark ? 'dark' : 'light',
  };
}

export function useRoutineStore() {
  const [state, setState] = useState<AppState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota fallback
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', state.theme === 'dark' ? '#09090B' : '#111827');
    }
  }, [state.theme]);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const getCell = useCallback(
    (dateKey: string, slotIndex: number): CellEntry | undefined => {
      return state.cellsByDate[dateKey]?.[slotIndex];
    },
    [state.cellsByDate]
  );

  const getEffectiveTask = useCallback(
    (dateKey: string, slotIndex: number) => {
      const base = state.routineSlots[slotIndex] ?? {
        slotIndex,
        title: `Task ${slotIndex + 1}`,
        timeLabel: '',
        category: 'Routine',
      };
      const cell = state.cellsByDate[dateKey]?.[slotIndex];
      return {
        title: cell?.customTitle?.trim() ? cell.customTitle : base.title,
        timeLabel: cell?.customTime !== undefined ? cell.customTime : base.timeLabel,
        category: base.category,
        isCustom: Boolean(cell?.customTitle?.trim() || cell?.customTime !== undefined),
      };
    },
    [state.routineSlots, state.cellsByDate]
  );

  const setCellStatus = useCallback(
    (
      dateKey: string,
      slotIndex: number,
      status: TaskStatus,
      options?: {
        partialNote?: string;
        punishmentMode?: PunishmentMode;
        customTitle?: string;
        customTime?: string;
      }
    ) => {
      setState((prev) => {
        const dayMap = { ...(prev.cellsByDate[dateKey] ?? {}) };
        const existing = dayMap[slotIndex];
        const baseSlot = prev.routineSlots[slotIndex];
        const effectiveTitle =
          options?.customTitle?.trim() ||
          existing?.customTitle?.trim() ||
          baseSlot?.title ||
          `Task ${slotIndex + 1}`;

        let nextPunishments = [...prev.punishments];
        let nextPunishmentId = existing?.punishmentId;

        if (status !== 'missed' && existing?.punishmentId) {
          // Remove unresolved or old punishment tied to this cell when no longer missed
          nextPunishments = nextPunishments.filter((p) => p.id !== existing.punishmentId);
          nextPunishmentId = undefined;
        }

        if (status === 'missed' && options?.punishmentMode) {
          const targetDate =
            options.punishmentMode === 'tomorrow'
              ? addDaysToKey(dateKey, 1)
              : dateKey;

          // Replace existing punishment for this cell if re-assigned
          if (existing?.punishmentId) {
            nextPunishments = nextPunishments.filter((p) => p.id !== existing.punishmentId);
          }

          const newId = `pun_${dateKey}_${slotIndex}_${Date.now()}`;
          const record: PunishmentRecord = {
            id: newId,
            sourceDate: dateKey,
            slotIndex,
            taskTitle: effectiveTitle,
            mode: options.punishmentMode,
            targetDate,
            resolved: false,
            createdAt: new Date().toISOString(),
          };
          nextPunishments.unshift(record);
          nextPunishmentId = newId;
        }

        const nextEntry: CellEntry = {
          status,
          customTitle:
            options?.customTitle !== undefined ? options.customTitle : existing?.customTitle,
          customTime:
            options?.customTime !== undefined ? options.customTime : existing?.customTime,
          partialNote:
            status === 'partial'
              ? options?.partialNote !== undefined
                ? options.partialNote
                : existing?.partialNote
              : undefined,
          punishmentId: status === 'missed' ? nextPunishmentId : undefined,
          updatedAt: new Date().toISOString(),
        };

        dayMap[slotIndex] = nextEntry;

        return {
          ...prev,
          cellsByDate: {
            ...prev.cellsByDate,
            [dateKey]: dayMap,
          },
          punishments: nextPunishments,
        };
      });
    },
    []
  );

  const updateCellCustomTask = useCallback(
    (dateKey: string, slotIndex: number, customTitle: string, customTime: string) => {
      setState((prev) => {
        const dayMap = { ...(prev.cellsByDate[dateKey] ?? {}) };
        const existing = dayMap[slotIndex];
        const trimmedTitle = customTitle.trim();
        const trimmedTime = customTime.trim();

        const nextEntry: CellEntry = {
          status: existing?.status ?? 'pending',
          customTitle: trimmedTitle || undefined,
          customTime: trimmedTime || undefined,
          partialNote: existing?.partialNote,
          punishmentId: existing?.punishmentId,
          updatedAt: new Date().toISOString(),
        };

        // Update linked punishment title if one exists
        const nextPunishments = existing?.punishmentId
          ? prev.punishments.map((p) =>
              p.id === existing.punishmentId
                ? {
                    ...p,
                    taskTitle:
                      trimmedTitle || prev.routineSlots[slotIndex]?.title || p.taskTitle,
                  }
                : p
            )
          : prev.punishments;

        dayMap[slotIndex] = nextEntry;
        return {
          ...prev,
          cellsByDate: {
            ...prev.cellsByDate,
            [dateKey]: dayMap,
          },
          punishments: nextPunishments,
        };
      });
    },
    []
  );

  const togglePunishmentResolved = useCallback((punishmentId: string) => {
    setState((prev) => ({
      ...prev,
      punishments: prev.punishments.map((p) =>
        p.id === punishmentId
          ? {
              ...p,
              resolved: !p.resolved,
              resolvedAt: !p.resolved ? new Date().toISOString() : undefined,
            }
          : p
      ),
    }));
  }, []);

  const switchPunishmentMode = useCallback((punishmentId: string, newMode: PunishmentMode) => {
    setState((prev) => ({
      ...prev,
      punishments: prev.punishments.map((p) => {
        if (p.id !== punishmentId) return p;
        return {
          ...p,
          mode: newMode,
          targetDate: newMode === 'tomorrow' ? addDaysToKey(p.sourceDate, 1) : p.sourceDate,
        };
      }),
    }));
  }, []);

  const updateRoutineSlot = useCallback(
    (slotIndex: number, patch: Partial<Omit<RoutineSlot, 'slotIndex'>>) => {
      setState((prev) => ({
        ...prev,
        routineSlots: prev.routineSlots.map((slot) =>
          slot.slotIndex === slotIndex ? { ...slot, ...patch } : slot
        ),
      }));
    },
    []
  );

  const applyRoutinePreset = useCallback((presetKey: keyof typeof ROUTINE_PRESETS) => {
    const preset = ROUTINE_PRESETS[presetKey];
    if (!preset) return;
    setState((prev) => ({
      ...prev,
      routineSlots: preset.map((s) => ({ ...s })),
    }));
  }, []);

  const clearWeekCells = useCallback((dateKeys: string[]) => {
    setState((prev) => {
      const nextCells = { ...prev.cellsByDate };
      const removedIds = new Set<string>();
      for (const dk of dateKeys) {
        const day = nextCells[dk];
        if (day) {
          Object.values(day).forEach((c) => {
            if (c.punishmentId) removedIds.add(c.punishmentId);
          });
          delete nextCells[dk];
        }
      }
      return {
        ...prev,
        cellsByDate: nextCells,
        punishments: prev.punishments.filter((p) => !removedIds.has(p.id)),
      };
    });
  }, []);

  const importStateJson = useCallback((jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText) as Partial<AppState>;
      if (!Array.isArray(parsed.routineSlots) || parsed.routineSlots.length !== 10) {
        return false;
      }
      setState({
        routineSlots: parsed.routineSlots,
        cellsByDate: parsed.cellsByDate ?? {},
        punishments: Array.isArray(parsed.punishments) ? parsed.punishments : [],
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
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
  };
}
