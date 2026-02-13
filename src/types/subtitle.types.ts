export interface SubtitleEntry {
  id: string;
  sequenceNumber: number;
  startTime: string; // "00:00:01,000"
  endTime: string;   // "00:00:04,000"
  text: string;
}

export interface SRTFile {
  entries: SubtitleEntry[];
  metadata?: {
    title?: string;
    language?: string;
    createdAt: Date;
  };
}

export interface VideoProcessingOptions {
  subtitleType: 'hard' | 'soft';
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  backgroundColor?: string;
  position?: 'top' | 'center' | 'bottom';
  alignment?: 'left' | 'center' | 'right';
}

export interface SubtitleTemplate {
  id: string;
  name: string;
  description: string;
  maxCharsPerLine: number;
  defaultDuration: number; // seconds
  icon: string;
  entries: SubtitleEntry[];
}

export type ExportFormat = 'srt' | 'vtt' | 'txt' | 'ass';
