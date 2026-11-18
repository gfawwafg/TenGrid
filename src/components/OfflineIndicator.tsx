import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-18 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-3.5 py-2 text-xs font-medium shadow-lg border border-zinc-800 dark:border-zinc-200">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline mode · Changes saved locally</span>
    </div>
  );
};
