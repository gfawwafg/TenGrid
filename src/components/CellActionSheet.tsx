import React, { useEffect, useState } from 'react';
import {
  CalendarPlus,
  Check,
  Clock,
  Edit3,
  Moon,
  RotateCcw,
  X,
} from 'lucide-react';
import { CellEntry, PunishmentMode, PunishmentRecord, TaskStatus } from '../types/routine';
import { formatReadableDate } from '../utils/dates';

interface CellActionSheetProps {
  isOpen: boolean;
  dateKey: string;
  dayFull: string;
  slotIndex: number;
  taskTitle: string;
  taskTime: string;
  category: string;
  entry?: CellEntry;
  linkedPunishment?: PunishmentRecord;
  initialStep?: 'status' | 'punishment';
  onClose: () => void;
  onSelectStatus: (
    status: TaskStatus,
    options?: {
      partialNote?: string;
      punishmentMode?: PunishmentMode;
    }
  ) => void;
  onUpdateCustomTask: (title: string, time: string) => void;
  onTogglePunishmentResolved: (punishmentId: string) => void;
}

export const CellActionSheet: React.FC<CellActionSheetProps> = ({
  isOpen,
  dateKey,
  dayFull,
  slotIndex,
  taskTitle,
  taskTime,
  category,
  entry,
  linkedPunishment,
  initialStep = 'status',
  onClose,
  onSelectStatus,
  onUpdateCustomTask,
  onTogglePunishmentResolved,
}) => {
  const [step, setStep] = useState<'status' | 'partial' | 'punishment' | 'edit'>('status');
  const [partialNote, setPartialNote] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setPartialNote(entry?.partialNote ?? '');
      setEditTitle(taskTitle);
      setEditTime(taskTime);
    }
  }, [isOpen, initialStep, entry?.partialNote, taskTitle, taskTime]);

  if (!isOpen) return null;

  const status: TaskStatus = entry?.status ?? 'pending';

  const handleSavePartial = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectStatus('partial', { partialNote: partialNote.trim() || 'Partially done' });
    onClose();
  };

  const handleChoosePunishment = (mode: PunishmentMode) => {
    onSelectStatus('missed', { punishmentMode: mode });
    onClose();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCustomTask(editTitle, editTime);
    setStep('status');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cell-sheet-title"
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
              <span>Slot {String(slotIndex + 1).padStart(2, '0')}</span>
              <span aria-hidden="true">·</span>
              <span>{dayFull}</span>
              <span aria-hidden="true">·</span>
              <span>{formatReadableDate(dateKey)}</span>
              {taskTime && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{taskTime}</span>
                </>
              )}
            </div>
            <h3
              id="cell-sheet-title"
              className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate"
            >
              {taskTitle}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {category}
              {status !== 'pending' && (
                <>
                  {' · '}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Current:{' '}
                    {status === 'done'
                      ? 'Done (Green)'
                      : status === 'partial'
                      ? 'Partial (Yellow)'
                      : 'Missed (Red)'}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setStep(step === 'edit' ? 'status' : 'edit')}
              aria-label="Edit task for this day"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step: Edit cell task */}
        {step === 'edit' && (
          <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Task name for {dayFull}
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter task name"
                className="w-full min-h-[44px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Time label (optional)
              </label>
              <input
                type="text"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                placeholder="e.g. 07:30 or Evening"
                className="w-full min-h-[44px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep('status')}
                className="flex-1 min-h-[44px] rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[44px] rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Save Task
              </button>
            </div>
          </form>
        )}

        {/* Step: Status Selection */}
        {step === 'status' && (
          <div className="mt-5 space-y-2.5">
            {linkedPunishment && status === 'missed' && (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-red-800 dark:text-red-300">
                    Punishment: {linkedPunishment.mode === 'night' ? 'Stay Up Tonight' : 'Do Tomorrow'}
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                    {linkedPunishment.resolved
                      ? 'Completed and cleared'
                      : linkedPunishment.mode === 'night'
                      ? 'Due tonight before sleep'
                      : `Carried over to ${formatReadableDate(linkedPunishment.targetDate)}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePunishmentResolved(linkedPunishment.id)}
                  className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    linkedPunishment.resolved
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {linkedPunishment.resolved ? 'Paid' : 'Mark Paid'}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onSelectStatus('done');
                onClose();
              }}
              className="w-full min-h-[54px] flex items-center justify-between rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Done — Turn Green</div>
                  <div className="text-xs text-emerald-100">Completed the full routine task</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStep('partial')}
              className="w-full min-h-[54px] flex items-center justify-between rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" strokeWidth={2.25} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Partial — Turn Yellow</div>
                  <div className="text-xs text-zinc-800">Finished part of it · Add note</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStep('punishment')}
              className="w-full min-h-[54px] flex items-center justify-between rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Missed — Turn Red &amp; Assign Punishment</div>
                  <div className="text-xs text-red-100">Choose Stay Up Tonight or Do Tomorrow</div>
                </div>
              </div>
            </button>

            {status !== 'pending' && (
              <button
                type="button"
                onClick={() => {
                  onSelectStatus('pending');
                  onClose();
                }}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear to Pending</span>
              </button>
            )}
          </div>
        )}

        {/* Step: Partial Note */}
        {step === 'partial' && (
          <form onSubmit={handleSavePartial} className="mt-5 space-y-4">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-3.5">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                Marking Partial (Yellow)
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                Log what portion you finished so you know where you left off.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Progress note (optional)
              </label>
              <input
                type="text"
                value={partialNote}
                onChange={(e) => setPartialNote(e.target.value)}
                placeholder="e.g. Did 15/30 mins or 10 pages"
                autoFocus
                className="w-full min-h-[44px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('status')}
                className="flex-1 min-h-[44px] rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 text-sm font-semibold"
              >
                Save Yellow
              </button>
            </div>
          </form>
        )}

        {/* Step: Punishment Choice */}
        {step === 'punishment' && (
          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3.5">
              <p className="text-xs font-semibold text-red-900 dark:text-red-300">
                Task Missed — Choose Your Punishment
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                This cell turns Red and locks a mandatory penalty until you pay it off.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleChoosePunishment('night')}
              className="w-full min-h-[64px] flex items-center gap-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 p-4 text-left transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 dark:text-red-600 flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Stay Up Tonight</div>
                <div className="text-xs text-zinc-300 dark:text-zinc-600">
                  Stay awake tonight and finish &ldquo;{taskTitle}&rdquo; before sleep
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleChoosePunishment('tomorrow')}
              className="w-full min-h-[64px] flex items-center gap-3.5 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-zinc-950 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-900 dark:text-zinc-100 p-4 text-left transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <CalendarPlus className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Do It Tomorrow</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Add as mandatory double-load carryover penalty tomorrow
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStep('status')}
              className="w-full min-h-[44px] rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Back to status options
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
