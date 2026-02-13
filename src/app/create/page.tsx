'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

const STORAGE_KEY = 'subtitleforge-entries';
const TEMPLATE_KEY = 'subtitleforge-template';

export default function CreatePage() {
  const [entries, setEntries] = useState<SubtitleEntry[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [maxCharsPerLine, setMaxCharsPerLine] = useState(50);
  const [defaultDuration, setDefaultDuration] = useState(3);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('srt');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedTemplate = localStorage.getItem(TEMPLATE_KEY);
      if (saved) {
        setEntries(JSON.parse(saved));
      }
      if (savedTemplate) {
        const t = subtitleTemplates.find((t) => t.id === savedTemplate);
        if (t) {
          setSelectedTemplate(t.id);
          setMaxCharsPerLine(t.maxCharsPerLine);
          setDefaultDuration(t.defaultDuration);
        }
      }
    } catch {
      // ignore
    }
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
    // Deep copy template entries
    const newEntries = template.entries.map((e) => ({
      ...e,
      id: crypto.randomUUID(),
    }));
    setEntries(newEntries);
    localStorage.setItem(TEMPLATE_KEY, template.id);
  }, []);

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
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

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
    setEntries((prev) => [...prev, newEntry]);
  }, [entries, defaultDuration]);

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
        setEntries(parsed);
      }
    };
    input.click();
  }, []);

  const handlePreview = useCallback(() => {
    const text = convertEntries(entries, exportFormat);
    setPreviewText(text);
    setShowPreview(!showPreview);
  }, [entries, exportFormat, showPreview]);

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
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [exportFormat, handleExport]);

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

        {/* Subtitle List */}
        <SubtitleList
          entries={entries}
          maxCharsPerLine={maxCharsPerLine}
          onUpdate={handleUpdateEntry}
          onRemove={handleRemoveEntry}
          onAdd={handleAddEntry}
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
