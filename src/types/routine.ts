export type TaskStatus = 'pending' | 'done' | 'partial' | 'missed';

export type PunishmentMode = 'night' | 'tomorrow';

export interface RoutineSlot {
  slotIndex: number; // 0 to 9 (10 cells per day)
  title: string;
  timeLabel: string;
  category: string;
}

export interface CellEntry {
  status: TaskStatus;
  customTitle?: string;
  customTime?: string;
  partialNote?: string;
  punishmentId?: string;
  updatedAt: string;
}

export interface PunishmentRecord {
  id: string;
  sourceDate: string; // YYYY-MM-DD
  slotIndex: number;
  taskTitle: string;
  mode: PunishmentMode;
  targetDate: string; // same day for 'night', next day for 'tomorrow'
  resolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface AppState {
  routineSlots: RoutineSlot[];
  cellsByDate: Record<string, Record<number, CellEntry>>;
  punishments: PunishmentRecord[];
  theme: 'light' | 'dark';
}
