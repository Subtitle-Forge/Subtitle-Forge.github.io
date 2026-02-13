'use client';

import React from 'react';
import { VideoProcessingOptions } from '@/types/subtitle.types';

interface StyleCustomizerProps {
  options: VideoProcessingOptions;
  onChange: (options: VideoProcessingOptions) => void;
}

const fontFamilies = ['Arial', 'Helvetica', 'Roboto', 'Times New Roman', 'Courier New', 'Verdana'];

export default function StyleCustomizer({ options, onChange }: StyleCustomizerProps) {
  const update = (partial: Partial<VideoProcessingOptions>) =>
    onChange({ ...options, ...partial });

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Subtitle Style
      </h3>

      {/* Subtitle Type */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => update({ subtitleType: 'hard' })}
          className={`rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-all ${
            options.subtitleType === 'hard'
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
              : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
          }`}
        >
          <div className="font-semibold">Hard Subtitles</div>
          <div className="text-xs mt-0.5 opacity-75">Burned into video</div>
        </button>
        <button
          onClick={() => update({ subtitleType: 'soft' })}
          className={`rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-all ${
            options.subtitleType === 'soft'
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
              : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
          }`}
        >
          <div className="font-semibold">Soft Subtitles</div>
          <div className="text-xs mt-0.5 opacity-75">Separate track</div>
        </button>
      </div>

      {options.subtitleType === 'hard' && (
        <div className="space-y-3">
          {/* Font Family */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Font Family
            </label>
            <select
              value={options.fontFamily || 'Arial'}
              onChange={(e) => update({ fontFamily: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              {fontFamilies.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Font Size: {options.fontSize || 24}px
            </label>
            <input
              type="range"
              min="12"
              max="72"
              value={options.fontSize || 24}
              onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Font Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Font Color
              </label>
              <input
                type="color"
                value={options.fontColor || '#ffffff'}
                onChange={(e) => update({ fontColor: e.target.value })}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Background Color
              </label>
              <input
                type="color"
                value={options.backgroundColor || '#000000'}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => update({ position: pos })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors ${
                    (options.position || 'bottom') === pos
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
