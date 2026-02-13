'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SubtitleEntry, SubtitleTemplate } from '@/types/subtitle.types';
import { ExportFormat } from '@/types/subtitle.types';
import TemplateSelector from '@/components/subtitle-editor/TemplateSelector';
import SubtitleList from '@/components/subtitle-editor/SubtitleList';
import { subtitleTemplates } from '@/lib/templates';
import { downloadFile, copyToClipboard, convertEntries } from '@/lib/file-converter';
import { parseSRT, msToTime, timeToMs } from '@/lib/subtitle-parser';
import {
  Download,
  Copy,
  FileUp,
  Save,
  Check,
  ChevronDown,
  Undo2,
  Redo2,
  Trash2,
  Clock,
  CheckSquare,
} from 'lucide-react';

const STORAGE_KEY = 'subtitleforge-entries';
const TEMPLATE_KEY = 'subtitleforge-template';
const MAX_HISTORY = 50;

function loadSavedEntries(): SubtitleEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

function loadSavedTemplate(): { id: string; maxCharsPerLine: number; defaultDuration: number } {
  if (typeof window === 'undefined') return { id: 'custom', maxCharsPerLine: 50, defaultDuration: 3 };
  try {
    const savedTemplate = localStorage.getItem(TEMPLATE_KEY);
    if (savedTemplate) {
      const t = subtitleTemplates.find((t) => t.id === savedTemplate);
      if (t) return { id: t.id, maxCharsPerLine: t.maxCharsPerLine, defaultDuration: t.defaultDuration };
    }
  } catch {
    // ignore
  }
  return { id: 'custom', maxCharsPerLine: 50, defaultDuration: 3 };
}

export default function CreatePage() {
  const initialTemplate = loadSavedTemplate();
  const [entries, setEntries] = useState<SubtitleEntry[]>(loadSavedEntries);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate.id);
  const [maxCharsPerLine, setMaxCharsPerLine] = useState(initialTemplate.maxCharsPerLine);
  const [defaultDuration, setDefaultDuration] = useState(initialTemplate.defaultDuration);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('srt');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [shiftSeconds, setShiftSeconds] = useState('0');

  // Undo/Redo history
  const historyRef = useRef<SubtitleEntry[][]>([]);
  const historyPointerRef = useRef(-1);
  const skipHistoryRef = useRef(false);

  const pushHistory = useCallback((newEntries: SubtitleEntry[]) => {
    const history = historyRef.current;
    const pointer = historyPointerRef.current;
    // Trim any future states beyond current pointer
    historyRef.current = history.slice(0, pointer + 1);
    historyRef.current.push(JSON.parse(JSON.stringify(newEntries)));
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    historyPointerRef.current = historyRef.current.length - 1;
  }, []);

  // Initialize history with the loaded entries
  const historyInitializedRef = useRef(false);
  useEffect(() => {
    if (!historyInitializedRef.current) {
      historyInitializedRef.current = true;
      pushHistory(entries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushHistory]);

  const setEntriesWithHistory = useCallback(
    (updater: SubtitleEntry[] | ((prev: SubtitleEntry[]) => SubtitleEntry[])) => {
      setEntries((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (!skipHistoryRef.current) {
          pushHistory(next);
        }
        return next;
      });
    },
    [pushHistory]
  );

  const handleUndo = useCallback(() => {
    const pointer = historyPointerRef.current;
    if (pointer <= 0) return;
    historyPointerRef.current = pointer - 1;
    skipHistoryRef.current = true;
    setEntries(JSON.parse(JSON.stringify(historyRef.current[pointer - 1])));
    skipHistoryRef.current = false;
  }, []);

  const handleRedo = useCallback(() => {
    const pointer = historyPointerRef.current;
    if (pointer >= historyRef.current.length - 1) return;
    historyPointerRef.current = pointer + 1;
    skipHistoryRef.current = true;
    setEntries(JSON.parse(JSON.stringify(historyRef.current[pointer + 1])));
    skipHistoryRef.current = false;
  }, []);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch {
        // ignore
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [entries]);

  const handleSelectTemplate = useCallback((template: SubtitleTemplate) => {
    setSelectedTemplate(template.id);
    setMaxCharsPerLine(template.maxCharsPerLine);
    setDefaultDuration(template.defaultDuration);
    const newEntries = template.entries.map((e) => ({
      ...e,
      id: crypto.randomUUID(),
    }));
    setEntriesWithHistory(newEntries);
    localStorage.setItem(TEMPLATE_KEY, template.id);
  }, [setEntriesWithHistory]);

  const handleUpdateEntry = useCallback(
    (id: string, field: keyof SubtitleEntry, value: string) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, [field]: value } : entry
        )
      );
    },
    []
  );

  const handleRemoveEntry = useCallback((id: string) => {
    setEntriesWithHistory((prev) => prev.filter((e) => e.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [setEntriesWithHistory]);

  const handleAddEntry = useCallback(() => {
    const lastEntry = entries[entries.length - 1];
    let startMs = 0;
    if (lastEntry) {
      try {
        startMs = timeToMs(lastEntry.endTime) + 1000;
      } catch {
        startMs = 0;
      }
    }
    const endMs = startMs + defaultDuration * 1000;

    const newEntry: SubtitleEntry = {
      id: crypto.randomUUID(),
      sequenceNumber: entries.length + 1,
      startTime: msToTime(startMs),
      endTime: msToTime(endMs),
      text: '',
    };
    setEntriesWithHistory((prev) => [...prev, newEntry]);
  }, [entries, defaultDuration, setEntriesWithHistory]);

  const handleReorder = useCallback(
    (reordered: SubtitleEntry[]) => {
      setEntriesWithHistory(reordered);
    },
    [setEntriesWithHistory]
  );

  const handleExport = useCallback(
    (format: ExportFormat) => {
      if (entries.length === 0) return;
      downloadFile(entries, format);
      setShowExportMenu(false);
    },
    [entries]
  );

  const handleCopy = useCallback(async () => {
    if (entries.length === 0) return;
    await copyToClipboard(entries, exportFormat);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [entries, exportFormat]);

  const handleImportSrt = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.srt,.vtt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const parsed = parseSRT(text);
      if (parsed.length > 0) {
        setEntriesWithHistory(parsed);
      }
    };
    input.click();
  }, [setEntriesWithHistory]);

  const handlePreview = useCallback(() => {
    const text = convertEntries(entries, exportFormat);
    setPreviewText(text);
    setShowPreview(!showPreview);
  }, [entries, exportFormat, showPreview]);

  // Bulk operations
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === entries.length) return new Set();
      return new Set(entries.map((e) => e.id));
    });
  }, [entries]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    setEntriesWithHistory((prev) =>
      prev
        .filter((e) => !selectedIds.has(e.id))
        .map((e, i) => ({ ...e, sequenceNumber: i + 1 }))
    );
    setSelectedIds(new Set());
  }, [selectedIds, setEntriesWithHistory]);

  const handleShiftTimings = useCallback(() => {
    const ms = Math.round(parseFloat(shiftSeconds) * 1000);
    if (isNaN(ms)) return;
    if (ms === 0) {
      setShowShiftDialog(false);
      return;
    }
    setEntriesWithHistory((prev) =>
      prev.map((entry) => {
        const newStart = Math.max(0, timeToMs(entry.startTime) + ms);
        const newEnd = Math.max(0, timeToMs(entry.endTime) + ms);
        return {
          ...entry,
          startTime: msToTime(newStart),
          endTime: msToTime(newEnd),
        };
      })
    );
    setShowShiftDialog(false);
    setShiftSeconds('0');
  }, [shiftSeconds, setEntriesWithHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport(exportFormat);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [exportFormat, handleExport, handleUndo, handleRedo]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Create Subtitles
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Build SRT subtitle files from templates or from scratch
        </p>
      </div>

      <div className="space-y-6">
        {/* Save notification */}
        {saved && (
          <div className="fixed top-20 right-4 z-50 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
            ✓ Saved to browser storage
          </div>
        )}

        {/* Template Selector */}
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onSelect={handleSelectTemplate}
        />

        {/* Bulk Operations Bar */}
        {entries.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
            <label className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <CheckSquare className="h-4 w-4" />
              <input
                type="checkbox"
                checked={selectedIds.size === entries.length && entries.length > 0}
                onChange={handleToggleSelectAll}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="hidden sm:inline">Select All</span>
            </label>

            {selectedIds.size > 0 && (
              <>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Selected
                </button>
              </>
            )}

            <button
              onClick={() => setShowShiftDialog(!showShiftDialog)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <Clock className="h-3.5 w-3.5" />
              Shift Timings
            </button>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={handleUndo}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Undo</span>
              </button>
              <button
                onClick={handleRedo}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Redo</span>
              </button>
            </div>
          </div>
        )}

        {/* Shift Timings Dialog */}
        {showShiftDialog && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Shift All Timings
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={shiftSeconds}
                onChange={(e) => setShiftSeconds(e.target.value)}
                className="w-32 rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                placeholder="Seconds"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                seconds (negative to shift earlier)
              </span>
              <button
                onClick={handleShiftTimings}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => setShowShiftDialog(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Subtitle List */}
        <SubtitleList
          entries={entries}
          maxCharsPerLine={maxCharsPerLine}
          onUpdate={handleUpdateEntry}
          onRemove={handleRemoveEntry}
          onAdd={handleAddEntry}
          onReorder={handleReorder}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
        />

        {/* Preview Panel */}
        {showPreview && entries.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Preview ({exportFormat.toUpperCase()})
            </h3>
            <pre className="max-h-64 overflow-auto rounded-lg bg-white p-4 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono whitespace-pre-wrap">
              {previewText}
            </pre>
          </div>
        )}

        {/* Action Bar */}
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/90 backdrop-blur-sm px-4 py-4 dark:border-slate-700 dark:bg-slate-900/90 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleImportSrt}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <FileUp className="h-4 w-4" />
              <span className="hidden sm:inline">Import SRT</span>
            </button>

            <button
              onClick={handlePreview}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Preview'}</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={entries.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>

            <div className="relative ml-auto">
              <div className="flex">
                <button
                  onClick={() => handleExport(exportFormat)}
                  disabled={entries.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-l-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export .{exportFormat}
                </button>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={entries.length === 0}
                  className="inline-flex items-center rounded-r-lg border-l border-blue-700 bg-blue-600 px-2 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800 z-20">
                  {(['srt', 'vtt', 'txt', 'ass'] as ExportFormat[]).map(
                    (format) => (
                      <button
                        key={format}
                        onClick={() => {
                          setExportFormat(format);
                          handleExport(format);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Download as .{format}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
