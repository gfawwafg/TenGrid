import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handlePress = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePress}
        className={
          variant === 'full'
            ? 'w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0'
            : 'min-h-[40px] flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0'
        }
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>Install App</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
        >
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl">
            <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="install-guide-title"
                    className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    Install TenGrid on Your Phone
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Works offline with full-screen app launch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install instructions"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              {isIOS ? (
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Tap the <strong>Share</strong> icon in Safari&apos;s bottom bar.
                  </li>
                  <li>
                    Scroll down and select <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> to pin TenGrid to your home screen.
                  </li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Open this page in <strong>Chrome</strong> on {isAndroid ? 'your Android phone' : 'Android'}.
                  </li>
                  <li>
                    Tap the <strong>three-dot menu (⋮)</strong> in the top-right corner.
                  </li>
                  <li>
                    Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.
                  </li>
                </ol>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full min-h-[44px] rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
