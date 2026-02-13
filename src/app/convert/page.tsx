'use client';

import React, { useState, useCallback, useRef } from 'react';
import { SubtitleEntry, ExportFormat } from '@/types/subtitle.types';
import { parseSRT } from '@/lib/subtitle-parser';
import { convertEntries, downloadFile } from '@/lib/file-converter';
import {
  FileUp,
  ArrowRightLeft,
  Download,
  Copy,
  Check,
  FileText,
} from 'lucide-react';

const formats: { value: ExportFormat; label: string; ext: string }[] = [
  { value: 'srt', label: 'SubRip (.srt)', ext: '.srt' },
  { value: 'vtt', label: 'WebVTT (.vtt)', ext: '.vtt' },
  { value: 'txt', label: 'Plain Text (.txt)', ext: '.txt' },
  { value: 'ass', label: 'Advanced SSA (.ass)', ext: '.ass' },
];

export default function ConvertPage() {
  const [entries, setEntries] = useState<SubtitleEntry[]>([]);
  const [inputFormat, setInputFormat] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<ExportFormat>('vtt');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      setInputFormat(ext);
      file.text().then((text) => {
        setInputText(text);
        const parsed = parseSRT(text);
        setEntries(parsed);
        if (parsed.length > 0) {
          setOutputText(convertEntries(parsed, outputFormat));
        }
      });
    },
    [outputFormat]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processFile(file);
    },
    [processFile]
  );

  const handleDropFile = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleConvert = useCallback(() => {
    if (entries.length === 0) return;
    const result = convertEntries(entries, outputFormat);
    setOutputText(result);
  }, [entries, outputFormat]);

  const handleOutputFormatChange = useCallback(
    (format: ExportFormat) => {
      setOutputFormat(format);
      if (entries.length > 0) {
        setOutputText(convertEntries(entries, format));
      }
    },
    [entries]
  );

  const handleDownload = useCallback(() => {
    if (entries.length === 0) return;
    const baseName = fileName ? fileName.replace(/\.[^.]+$/, '') : 'subtitles';
    downloadFile(entries, outputFormat, baseName);
  }, [entries, outputFormat, fileName]);

  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [outputText]);

  const handlePasteInput = useCallback(() => {
    const text = inputText;
    const parsed = parseSRT(text);
    setEntries(parsed);
    if (parsed.length > 0) {
      setOutputText(convertEntries(parsed, outputFormat));
    }
  }, [inputText, outputFormat]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Convert Formats
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Convert between SRT, VTT, TXT, and ASS subtitle formats
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Upload Subtitle File
          </h3>
          <label
            onDrop={handleDropFile}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                : 'border-slate-300 hover:border-blue-400 dark:border-slate-600 dark:hover:border-blue-500'
            }`}
          >
            <FileUp className={`mb-3 h-10 w-10 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`} />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {isDragOver
                ? 'Drop file here...'
                : fileName || 'Click to upload or drop a subtitle file'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Supports SRT, VTT, TXT, ASS formats
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".srt,.vtt,.txt,.ass"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Or paste text */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Or Paste Subtitle Text (SRT format)
          </h3>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            placeholder={`Paste SRT content here...\n\n1\n00:00:01,000 --> 00:00:04,000\nFirst subtitle text\n\n2\n00:00:05,000 --> 00:00:08,000\nSecond subtitle text`}
          />
          <button
            onClick={handlePasteInput}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Parse Input
          </button>
        </div>

        {/* Format Selection */}
        {entries.length > 0 && (
          <>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Input Format
                </p>
                <p className="text-lg font-bold text-slate-800 dark:text-white uppercase">
                  {inputFormat || 'SRT'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {entries.length} subtitle entries
                </p>
              </div>

              <ArrowRightLeft className="h-6 w-6 text-slate-400 rotate-0 sm:rotate-0" />

              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Output Format
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {formats.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => handleOutputFormatChange(f.value)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        outputFormat === f.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleConvert}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-center text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <ArrowRightLeft className="mr-2 inline h-4 w-4" />
              Convert to {outputFormat.toUpperCase()}
            </button>

            {/* Output */}
            {outputText && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Output ({outputFormat.toUpperCase()})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                </div>
                <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300 font-mono whitespace-pre-wrap">
                  {outputText}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
