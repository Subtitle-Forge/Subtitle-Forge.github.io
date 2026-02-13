import { SubtitleEntry } from '@/types/subtitle.types';

/**
 * Parse SRT or VTT format string into SubtitleEntry array
 */
export function parseSRT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];

  // Strip WEBVTT header and any metadata lines
  let cleaned = content.trim();
  if (cleaned.startsWith('WEBVTT')) {
    // Remove the WEBVTT header line and any following metadata lines before the first cue
    cleaned = cleaned.replace(/^WEBVTT[^\n]*\n(?:[^\n]+:[^\n]*\n)*\n?/, '');
  }

  const blocks = cleaned.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    let timeLineIndex = 0;
    let sequenceNumber = entries.length + 1;

    // Check if first line is a sequence number or a time line
    if (/^\d+$/.test(lines[0].trim())) {
      sequenceNumber = parseInt(lines[0], 10);
      timeLineIndex = 1;
    }

    if (timeLineIndex >= lines.length) continue;

    // Match both SRT format (comma) and VTT format (dot) timestamps
    const timeMatch = lines[timeLineIndex].match(
      /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
    );
    if (!timeMatch) continue;

    // Normalize to SRT format (use commas)
    const startTime = timeMatch[1].replace('.', ',');
    const endTime = timeMatch[2].replace('.', ',');
    const text = lines.slice(timeLineIndex + 1).join('\n');

    entries.push({
      id: crypto.randomUUID(),
      sequenceNumber,
      startTime,
      endTime,
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
  const [sec, ms] = parts[2].split(',');
  const centiseconds = ms.substring(0, 2);
  return `${hours}:${minutes}:${sec}.${centiseconds}`;
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
