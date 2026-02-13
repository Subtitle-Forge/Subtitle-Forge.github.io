import { SubtitleEntry } from '@/types/subtitle.types';

/**
 * Parse SRT format string into SubtitleEntry array
 */
export function parseSRT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const sequenceNumber = parseInt(lines[0], 10);
    if (isNaN(sequenceNumber)) continue;

    const timeMatch = lines[1].match(
      /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/
    );
    if (!timeMatch) continue;

    const text = lines.slice(2).join('\n');

    entries.push({
      id: crypto.randomUUID(),
      sequenceNumber,
      startTime: timeMatch[1],
      endTime: timeMatch[2],
      text,
    });
  }

  return entries;
}

/**
 * Convert SubtitleEntry array to SRT format string
 */
export function entriesToSRT(entries: SubtitleEntry[]): string {
  return entries
    .map(
      (entry, index) =>
        `${index + 1}\n${entry.startTime} --> ${entry.endTime}\n${entry.text}`
    )
    .join('\n\n');
}

/**
 * Convert SubtitleEntry array to WebVTT format string
 */
export function entriesToVTT(entries: SubtitleEntry[]): string {
  const header = 'WEBVTT\n\n';
  const body = entries
    .map((entry, index) => {
      const startTime = entry.startTime.replace(',', '.');
      const endTime = entry.endTime.replace(',', '.');
      return `${index + 1}\n${startTime} --> ${endTime}\n${entry.text}`;
    })
    .join('\n\n');
  return header + body;
}

/**
 * Convert SubtitleEntry array to plain text
 */
export function entriesToTXT(entries: SubtitleEntry[]): string {
  return entries.map((entry) => entry.text).join('\n\n');
}

/**
 * Convert SubtitleEntry array to ASS format string
 */
export function entriesToASS(entries: SubtitleEntry[]): string {
  const header = `[Script Info]
Title: SubtitleForge Export
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,2,1,2,10,10,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = entries
    .map((entry) => {
      const start = srtTimeToASS(entry.startTime);
      const end = srtTimeToASS(entry.endTime);
      const text = entry.text.replace(/\n/g, '\\N');
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`;
    })
    .join('\n');

  return header + events;
}

function srtTimeToASS(srtTime: string): string {
  // "00:00:01,000" -> "0:00:01.00"
  const parts = srtTime.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const secMs = parts[2].replace(',', '.');
  const sec = secMs.substring(0, secMs.length - 1); // trim last digit of ms
  return `${hours}:${minutes}:${sec}`;
}

/**
 * Validate SRT time format
 */
export function isValidTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}:\d{2},\d{3}$/.test(time);
}

/**
 * Convert time string to milliseconds
 */
export function timeToMs(time: string): number {
  const [h, m, sMs] = time.split(':');
  const [s, ms] = sMs.split(',');
  return (
    parseInt(h) * 3600000 +
    parseInt(m) * 60000 +
    parseInt(s) * 1000 +
    parseInt(ms)
  );
}

/**
 * Convert milliseconds to SRT time format
 */
export function msToTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

/**
 * Calculate duration between two SRT timestamps
 */
export function calculateDuration(startTime: string, endTime: string): number {
  return timeToMs(endTime) - timeToMs(startTime);
}
