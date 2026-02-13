'use client';

import React from 'react';
import { SubtitleEntry } from '@/types/subtitle.types';
import TimeInput from './TimeInput';
import { Trash2, GripVertical } from 'lucide-react';
import { calculateDuration, timeToMs } from '@/lib/subtitle-parser';

interface SubtitleEntryCardProps {
  entry: SubtitleEntry;
  index: number;
  maxCharsPerLine: number;
  onUpdate: (id: string, field: keyof SubtitleEntry, value: string) => void;
  onRemove: (id: string) => void;
  // Drag-and-drop props
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  // Validation props
  prevEndTime?: string;
  // Selection props
  selected?: boolean;
  onToggleSelect?: () => void;
  // Focus management
  textareaRef?: React.RefCallback<HTMLTextAreaElement>;
}

export default function SubtitleEntryCard({
  entry,
  index,
  maxCharsPerLine,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
  prevEndTime,
  selected,
  onToggleSelect,
  textareaRef,
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

  // Time validation
  let endBeforeStart = false;
  try {
    endBeforeStart = timeToMs(entry.endTime) <= timeToMs(entry.startTime);
  } catch { /* invalid time */ }

  let overlapWarning = false;
  if (prevEndTime) {
    try {
      overlapWarning = timeToMs(entry.startTime) < timeToMs(prevEndTime);
    } catch { /* invalid time */ }
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`group relative rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
        isDragging
          ? 'opacity-50 border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : isDragOver
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-300 dark:ring-blue-600'
            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-1">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={!!selected}
              onChange={onToggleSelect}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mb-1"
            />
          )}
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

          {endBeforeStart && (
            <div className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
              ⚠ End time must be after start time
            </div>
          )}
          {overlapWarning && (
            <div className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              ⚠ Overlaps with previous subtitle entry
            </div>
          )}

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
              ref={textareaRef}
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
