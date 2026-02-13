'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number;
  message?: string;
  onCancel?: () => void;
}

export default function ProgressBar({ progress, message, onCancel }: ProgressBarProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {message || 'Processing...'}
        </span>
        <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-3 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
