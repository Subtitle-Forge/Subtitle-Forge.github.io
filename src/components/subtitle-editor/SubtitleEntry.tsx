'use client';

import React from 'react';
import { SubtitleEntry } from '@/types/subtitle.types';
import TimeInput from './TimeInput';
import { Trash2, GripVertical } from 'lucide-react';
import { calculateDuration } from '@/lib/subtitle-parser';

interface SubtitleEntryCardProps {
  entry: SubtitleEntry;
  index: number;
  maxCharsPerLine: number;
  onUpdate: (id: string, field: keyof SubtitleEntry, value: string) => void;
  onRemove: (id: string) => void;
}

export default function SubtitleEntryCard({
  entry,
  index,
  maxCharsPerLine,
  onUpdate,
  onRemove,
}: SubtitleEntryCardProps) {
  const lines = entry.text.split('\n');
  const maxLineLength = Math.max(...lines.map((l) => l.length));
  const charWarning = maxLineLength > maxCharsPerLine;

  let durationMs = 0;
  try {
    durationMs = calculateDuration(entry.startTime, entry.endTime);
  } catch {
    // invalid time
  }
  const durationSec = (durationMs / 1000).toFixed(1);

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-1">
          <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {index + 1}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TimeInput
              label="Start Time"
              value={entry.startTime}
              onChange={(v) => onUpdate(entry.id, 'startTime', v)}
            />
            <TimeInput
              label="End Time"
              value={entry.endTime}
              onChange={(v) => onUpdate(entry.id, 'endTime', v)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Subtitle Text
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${
                    charWarning
                      ? 'text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {maxLineLength}/{maxCharsPerLine} chars
                </span>
                {durationMs > 0 && (
                  <span className="text-xs text-slate-400">
                    {durationSec}s
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={entry.text}
              onChange={(e) => onUpdate(entry.id, 'text', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition-colors outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Enter subtitle text..."
            />
            {charWarning && (
              <div className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                ⚠ Line exceeds {maxCharsPerLine} characters (recommended max)
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onRemove(entry.id)}
          className="rounded-lg p-2 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/20"
          aria-label="Remove subtitle entry"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
