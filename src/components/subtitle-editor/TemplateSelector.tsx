'use client';

import React from 'react';
import { subtitleTemplates } from '@/lib/templates';
import { SubtitleTemplate } from '@/types/subtitle.types';
import {
  Mic,
  GraduationCap,
  Share2,
  Film,
  Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  mic: <Mic className="h-5 w-5" />,
  'graduation-cap': <GraduationCap className="h-5 w-5" />,
  'share-2': <Share2 className="h-5 w-5" />,
  film: <Film className="h-5 w-5" />,
  edit: <Edit className="h-5 w-5" />,
};

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (template: SubtitleTemplate) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Choose a Template
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {subtitleTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all hover:shadow-md',
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600'
            )}
          >
            <div
              className={cn(
                'rounded-lg p-2',
                selectedTemplate === template.id
                  ? 'bg-blue-100 dark:bg-blue-800/50'
                  : 'bg-slate-100 dark:bg-slate-700'
              )}
            >
              {iconMap[template.icon] || <Edit className="h-5 w-5" />}
            </div>
            <span className="text-sm font-medium">{template.name}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">
              {template.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
