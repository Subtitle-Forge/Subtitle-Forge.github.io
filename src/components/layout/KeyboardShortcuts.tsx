'use client';

import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

const shortcuts = [
  { keys: 'Ctrl + S', description: 'Save to browser storage' },
  { keys: 'Ctrl + E', description: 'Export subtitle file' },
  { keys: 'Ctrl + Z', description: 'Undo last action' },
  { keys: 'Ctrl + Y', description: 'Redo last action' },
  { keys: 'Alt + ↑', description: 'Navigate to previous entry' },
  { keys: 'Alt + ↓', description: 'Navigate to next entry' },
  { keys: 'Ctrl + /', description: 'Show keyboard shortcuts' },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (Ctrl+/)"
      >
        <Keyboard className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {shortcut.description}
                  </span>
                  <kbd className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-mono font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              Press <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-xs font-mono dark:border-slate-600 dark:bg-slate-700">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
