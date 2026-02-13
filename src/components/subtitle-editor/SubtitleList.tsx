'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SubtitleEntry as SubtitleEntryType } from '@/types/subtitle.types';
import SubtitleEntryCard from './SubtitleEntry';
import { Plus } from 'lucide-react';

interface SubtitleListProps {
  entries: SubtitleEntryType[];
  maxCharsPerLine: number;
  onUpdate: (id: string, field: keyof SubtitleEntryType, value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onReorder?: (entries: SubtitleEntryType[]) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export default function SubtitleList({
  entries,
  maxCharsPerLine,
  onUpdate,
  onRemove,
  onAdd,
  onReorder,
  selectedIds,
  onToggleSelect,
}: SubtitleListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const textareaMapRef = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  const getTextareaRef = useCallback((id: string) => (el: HTMLTextAreaElement | null) => {
    if (el) {
      textareaMapRef.current.set(id, el);
    } else {
      textareaMapRef.current.delete(id);
    }
  }, []);

  // Focus textarea when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < entries.length) {
      const id = entries[focusedIndex].id;
      const el = textareaMapRef.current.get(id);
      el?.focus();
    }
  }, [focusedIndex, entries]);

  // Arrow key navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (entries.length === 0) return;
      const target = e.target as HTMLElement;
      const isTextarea = target.tagName === 'TEXTAREA';

      if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(0, (prev < 0 ? 0 : prev) - 1));
      } else if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min(entries.length - 1, (prev < 0 ? -1 : prev) + 1)
        );
      } else if (e.key === 'Escape' && isTextarea) {
        setFocusedIndex(-1);
        (target as HTMLTextAreaElement).blur();
      }
    },
    [entries.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDragStart = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index || !onReorder) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...entries];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    // Update sequence numbers
    const updated = reordered.map((entry, i) => ({
      ...entry,
      sequenceNumber: i + 1,
    }));
    onReorder(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

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
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              isDragging={dragIndex === index}
              isDragOver={dragOverIndex === index && dragIndex !== index}
              prevEndTime={index > 0 ? entries[index - 1].endTime : undefined}
              selected={selectedIds?.has(entry.id)}
              onToggleSelect={
                onToggleSelect ? () => onToggleSelect(entry.id) : undefined
              }
              textareaRef={getTextareaRef(entry.id)}
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
