import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;

export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();

  ffmpeg.on('progress', ({ progress }) => {
    if (onProgress) {
      onProgress(Math.round(progress * 100));
    }
  });

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

export async function burnSubtitles(
  ffmpeg: FFmpeg,
  videoFile: File,
  srtContent: string,
  options: {
    fontSize?: number;
    fontFamily?: string;
    fontColor?: string;
    backgroundColor?: string;
    position?: 'top' | 'center' | 'bottom';
  } = {}
): Promise<Uint8Array> {
  const {
    fontSize = 24,
    fontFamily = 'Arial',
    fontColor = '#ffffff',
    backgroundColor = '#000000',
  } = options;

  // Convert hex color (#RRGGBB) to ASS color format (&H00BBGGRR)
  const toASSColor = (hex: string, alpha = '00') => {
    const c = hex.replace('#', '');
    const r = c.substring(0, 2);
    const g = c.substring(2, 4);
    const b = c.substring(4, 6);
    return `&H${alpha}${b}${g}${r}`.toUpperCase();
  };

  const assFontColor = toASSColor(fontColor);
  const assBackColor = toASSColor(backgroundColor, 'A0');

  await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
  await ffmpeg.writeFile('subtitles.srt', srtContent);

  await ffmpeg.exec([
    '-i',
    'input.mp4',
    '-vf',
    `subtitles=subtitles.srt:force_style='FontSize=${fontSize},FontName=${fontFamily},PrimaryColour=${assFontColor},BackColour=${assBackColor},BorderStyle=4'`,
    '-c:a',
    'copy',
    'output.mp4',
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return data as Uint8Array;
}

export async function embedSoftSubtitles(
  ffmpeg: FFmpeg,
  videoFile: File,
  srtContent: string
): Promise<Uint8Array> {
  await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
  await ffmpeg.writeFile('subtitles.srt', srtContent);

  await ffmpeg.exec([
    '-i',
    'input.mp4',
    '-i',
    'subtitles.srt',
    '-c',
    'copy',
    '-c:s',
    'mov_text',
    '-metadata:s:s:0',
    'language=eng',
    'output.mp4',
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return data as Uint8Array;
}
