'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export default function TimeInput({ value, onChange, label, className }: TimeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    // Allow typing, auto-format on blur
    onChange(v);
  };

  const handleBlur = () => {
    // Try to auto-format to HH:MM:SS,MMM
    const cleaned = value.replace(/[^\d]/g, '');
    if (cleaned.length >= 7) {
      const h = cleaned.substring(0, 2).padStart(2, '0');
      const m = cleaned.substring(2, 4).padStart(2, '0');
      const s = cleaned.substring(4, 6).padStart(2, '0');
      const ms = cleaned.substring(6, 9).padEnd(3, '0');
      onChange(`${h}:${m}:${s},${ms}`);
    }
  };

  const isValid = /^\d{2}:\d{2}:\d{2},\d{3}$/.test(value);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="00:00:00,000"
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm font-mono transition-colors',
          'bg-white dark:bg-slate-800',
          isValid
            ? 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            : 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500',
          'outline-none'
        )}
      />
    </div>
  );
}
