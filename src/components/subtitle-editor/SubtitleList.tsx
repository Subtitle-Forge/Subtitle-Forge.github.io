'use client';

import React from 'react';
import { SubtitleEntry as SubtitleEntryType } from '@/types/subtitle.types';
import SubtitleEntryCard from './SubtitleEntry';
import { Plus } from 'lucide-react';

interface SubtitleListProps {
  entries: SubtitleEntryType[];
  maxCharsPerLine: number;
  onUpdate: (id: string, field: keyof SubtitleEntryType, value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

export default function SubtitleList({
  entries,
  maxCharsPerLine,
  onUpdate,
  onRemove,
  onAdd,
}: SubtitleListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Subtitle Entries ({entries.length})
        </h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-12 text-center dark:border-slate-600">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No subtitle entries yet.
          </p>
          <button
            onClick={onAdd}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Your First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <SubtitleEntryCard
              key={entry.id}
              entry={entry}
              index={index}
              maxCharsPerLine={maxCharsPerLine}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
          <button
            onClick={onAdd}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:hover:border-blue-500"
          >
            <Plus className="h-4 w-4" />
            Add Another Entry
          </button>
        </div>
      )}
    </div>
  );
}
