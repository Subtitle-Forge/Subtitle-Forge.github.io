'use client';

import React, { useCallback } from 'react';
import { Upload, FileVideo } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  onVideoSelect: (file: File) => void;
  onSrtSelect: (file: File) => void;
  videoFile: File | null;
  srtFile: File | null;
}

export default function VideoUpload({
  onVideoSelect,
  onSrtSelect,
  videoFile,
  srtFile,
}: VideoUploadProps) {
  const handleVideoDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && /\.(mp4|webm|avi|mov|mkv)$/i.test(file.name)) {
        onVideoSelect(file);
      }
    },
    [onVideoSelect]
  );

  const handleSrtDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && /\.(srt|vtt)$/i.test(file.name)) {
        onSrtSelect(file);
      }
    },
    [onSrtSelect]
  );

  const preventDefault = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Video upload */}
      <div
        onDrop={handleVideoDrop}
        onDragOver={preventDefault}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
          videoFile
            ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
            : 'border-slate-300 hover:border-blue-400 dark:border-slate-600 dark:hover:border-blue-500'
        )}
      >
        <FileVideo className={cn('h-10 w-10 mb-3', videoFile ? 'text-green-600' : 'text-slate-400')} />
        {videoFile ? (
          <>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {videoFile.name}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
            </p>
            {videoFile.size > 500 * 1024 * 1024 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠ Large file - processing may take a while
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Drop video file here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              MP4, WebM, AVI, MOV, MKV
            </p>
          </>
        )}
        <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Upload className="h-4 w-4" />
          {videoFile ? 'Change Video' : 'Browse Files'}
          <input
            type="file"
            accept="video/mp4,video/webm,video/avi,video/quicktime,video/x-matroska"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onVideoSelect(file);
            }}
          />
        </label>
      </div>

      {/* SRT upload */}
      <div
        onDrop={handleSrtDrop}
        onDragOver={preventDefault}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
          srtFile
            ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
            : 'border-slate-300 hover:border-blue-400 dark:border-slate-600 dark:hover:border-blue-500'
        )}
      >
        <Upload className={cn('h-10 w-10 mb-3', srtFile ? 'text-green-600' : 'text-slate-400')} />
        {srtFile ? (
          <>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {srtFile.name}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {(srtFile.size / 1024).toFixed(1)} KB
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Drop subtitle file here
            </p>
            <p className="text-xs text-slate-400 mt-1">SRT or VTT files</p>
          </>
        )}
        <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
          <Upload className="h-4 w-4" />
          {srtFile ? 'Change SRT' : 'Browse Files'}
          <input
            type="file"
            accept=".srt,.vtt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSrtSelect(file);
            }}
          />
        </label>
      </div>
    </div>
  );
}
