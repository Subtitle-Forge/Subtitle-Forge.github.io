import { SubtitleEntry, ExportFormat } from '@/types/subtitle.types';
import {
  entriesToSRT,
  entriesToVTT,
  entriesToTXT,
  entriesToASS,
} from './subtitle-parser';

/**
 * Convert entries to the specified format string
 */
export function convertEntries(
  entries: SubtitleEntry[],
  format: ExportFormat
): string {
  switch (format) {
    case 'srt':
      return entriesToSRT(entries);
    case 'vtt':
      return entriesToVTT(entries);
    case 'txt':
      return entriesToTXT(entries);
    case 'ass':
      return entriesToASS(entries);
    default:
      return entriesToSRT(entries);
  }
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'srt':
      return 'application/x-subrip';
    case 'vtt':
      return 'text/vtt';
    case 'txt':
      return 'text/plain';
    case 'ass':
      return 'text/x-ssa';
    default:
      return 'text/plain';
  }
}

/**
 * Download entries as a file
 */
export function downloadFile(
  entries: SubtitleEntry[],
  format: ExportFormat,
  filename?: string
): void {
  const content = convertEntries(entries, format);
  const blob = new Blob([content], { type: getMimeType(format) });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || 'subtitles'}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy entries to clipboard in specified format
 */
export async function copyToClipboard(
  entries: SubtitleEntry[],
  format: ExportFormat
): Promise<void> {
  const content = convertEntries(entries, format);
  await navigator.clipboard.writeText(content);
}
