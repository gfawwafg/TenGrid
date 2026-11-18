import React, { useRef, useState } from 'react';
import { Download, Moon, Sun, Upload } from 'lucide-react';
import { ROUTINE_PRESETS } from '../hooks/useRoutineStore';
import { AppState, RoutineSlot } from '../types/routine';
import { PWAInstallButton } from './PWAInstallButton';

interface RoutineBuilderViewProps {
  routineSlots: RoutineSlot[];
  theme: 'light' | 'dark';
  fullState: AppState;
  onUpdateSlot: (slotIndex: number, patch: Partial<Omit<RoutineSlot, 'slotIndex'>>) => void;
  onApplyPreset: (presetKey: keyof typeof ROUTINE_PRESETS) => void;
  onToggleTheme: () => void;
  onImportState: (json: string) => boolean;
}

const CATEGORIES = ['Health', 'Fitness', 'Focus', 'Study', 'Admin', 'Home', 'Rest', 'Routine'];

export const RoutineBuilderView: React.FC<RoutineBuilderViewProps> = ({
  routineSlots,
  theme,
  fullState,
  onUpdateSlot,
  onApplyPreset,
  onToggleTheme,
  onImportState,
}) => {
  const [pendingPreset, setPendingPreset] = useState<keyof typeof ROUTINE_PRESETS | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tengrid-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImportState(String(reader.result ?? ''));
      setImportStatus(ok ? 'Backup restored successfully.' : 'Invalid backup JSON file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <section aria-label="10-cell routine builder and settings" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            My 10-Cell Daily Routine
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Changes update every pending cell across your weekly 7×10 table
          </p>
        </div>

        {/* Preset Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {pendingPreset ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onApplyPreset(pendingPreset);
                  setPendingPreset(null);
                }}
                className="min-h-[40px] px-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold"
              >
                Confirm Load
              </button>
              <button
                type="button"
                onClick={() => setPendingPreset(null)}
                className="min-h-[40px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPendingPreset('balanced')}
                className="min-h-[40px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Balanced Preset
              </button>
              <button
                type="button"
                onClick={() => setPendingPreset('student')}
                className="min-h-[40px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Student Preset
              </button>
              <button
                type="button"
                onClick={() => setPendingPreset('blank')}
                className="min-h-[40px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Blank Grid
              </button>
            </>
          )}
        </div>
      </div>

      {/* 10 Routine Slots Editor */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
        {routineSlots.map((slot) => (
          <div
            key={slot.slotIndex}
            className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-xs font-bold tabular-nums flex items-center justify-center shrink-0">
                {String(slot.slotIndex + 1).padStart(2, '0')}
              </span>
              <input
                type="text"
                value={slot.title}
                onChange={(e) => onUpdateSlot(slot.slotIndex, { title: e.target.value })}
                aria-label={`Routine slot ${slot.slotIndex + 1} title`}
                placeholder={`Routine Task ${slot.slotIndex + 1}`}
                className="flex-1 min-w-0 min-h-[44px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 px-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2 pl-9 sm:pl-0">
              <input
                type="text"
                value={slot.timeLabel}
                onChange={(e) => onUpdateSlot(slot.slotIndex, { timeLabel: e.target.value })}
                aria-label={`Routine slot ${slot.slotIndex + 1} time`}
                placeholder="07:00"
                className="w-24 min-h-[44px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 px-3 text-xs font-mono tabular-nums text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
              <select
                value={slot.category}
                onChange={(e) => onUpdateSlot(slot.slotIndex, { category: e.target.value })}
                aria-label={`Routine slot ${slot.slotIndex + 1} category`}
                className="flex-1 sm:w-28 min-h-[44px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 px-2.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Android App & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Android Home Screen App
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Install TenGrid directly onto your Android phone for instant offline access, or download the source zip to build an APK locally.
            </p>
          </div>
          <div className="space-y-2">
            <PWAInstallButton variant="full" />
            <a
              href="/tengrid-project.zip"
              download="tengrid-project.zip"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Project Source (.zip)</span>
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Theme &amp; Data Backup
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                All routine logs save locally on your device
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="min-h-[44px] px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 min-h-[44px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[44px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Restore JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {importStatus && (
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{importStatus}</p>
          )}
        </div>
      </div>
    </section>
  );
};
