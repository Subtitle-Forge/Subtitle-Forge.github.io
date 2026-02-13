'use client';

import React, { useState, useCallback, useRef } from 'react';
import VideoUpload from '@/components/video-processor/VideoUpload';
import StyleCustomizer from '@/components/video-processor/StyleCustomizer';
import ProgressBar from '@/components/video-processor/ProgressBar';
import { VideoProcessingOptions } from '@/types/subtitle.types';
import { Play, Download, AlertCircle } from 'lucide-react';

export default function EmbedPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [srtFile, setSrtFile] = useState<File | null>(null);
  const [options, setOptions] = useState<VideoProcessingOptions>({
    subtitleType: 'hard',
    fontSize: 24,
    fontFamily: 'Arial',
    fontColor: '#ffffff',
    backgroundColor: '#000000',
    position: 'bottom',
    alignment: 'center',
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const abortRef = useRef(false);

  const handleVideoSelect = useCallback((file: File) => {
    setVideoFile(file);
    setOutputUrl(null);
    setError(null);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  }, []);

  const handleSrtSelect = useCallback((file: File) => {
    setSrtFile(file);
    setOutputUrl(null);
    setError(null);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!videoFile || !srtFile) {
      setError('Please upload both a video file and a subtitle file.');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setOutputUrl(null);
    abortRef.current = false;

    try {
      setProgressMessage('Loading FFmpeg...');
      setProgress(5);

      const { loadFFmpeg, burnSubtitles, embedSoftSubtitles } = await import(
        '@/lib/ffmpeg-utils'
      );

      const ffmpeg = await loadFFmpeg((p) => {
        if (!abortRef.current) {
          setProgress(10 + p * 0.85);
        }
      });

      if (abortRef.current) return;

      setProgressMessage('Reading subtitle file...');
      setProgress(10);

      const srtContent = await srtFile.text();

      setProgressMessage('Processing video...');

      let outputData: Uint8Array;

      if (options.subtitleType === 'hard') {
        outputData = await burnSubtitles(ffmpeg, videoFile, srtContent, {
          fontSize: options.fontSize,
          fontFamily: options.fontFamily,
          fontColor: options.fontColor,
          backgroundColor: options.backgroundColor,
          position: options.position,
        });
      } else {
        outputData = await embedSoftSubtitles(ffmpeg, videoFile, srtContent);
      }

      if (abortRef.current) return;

      setProgress(100);
      setProgressMessage('Done!');

      const blob = new Blob([new Uint8Array(outputData)], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
    } catch (err) {
      if (!abortRef.current) {
        setError(
          err instanceof Error
            ? `Processing failed: ${err.message}`
            : 'An unexpected error occurred during processing.'
        );
      }
    } finally {
      setProcessing(false);
    }
  }, [videoFile, srtFile, options]);

  const handleCancel = useCallback(() => {
    abortRef.current = true;
    setProcessing(false);
    setProgressMessage('Cancelled');
  }, []);

  const handleDownload = useCallback(() => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `subtitled_${videoFile?.name || 'output.mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [outputUrl, videoFile]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Embed Subtitles
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Burn subtitles into your video or add them as a separate track
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload */}
        <VideoUpload
          videoFile={videoFile}
          srtFile={srtFile}
          onVideoSelect={handleVideoSelect}
          onSrtSelect={handleSrtSelect}
        />

        {/* Video Preview */}
        {videoPreviewUrl && (
          <div className="rounded-xl border border-slate-200 bg-black p-2 dark:border-slate-700">
            <video
              src={videoPreviewUrl}
              controls
              className="mx-auto max-h-[400px] w-full rounded-lg"
            />
          </div>
        )}

        {/* Style Options */}
        <StyleCustomizer options={options} onChange={setOptions} />

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Try using a smaller video file or a different format.
              </p>
            </div>
          </div>
        )}

        {/* Progress */}
        {processing && (
          <ProgressBar
            progress={progress}
            message={progressMessage}
            onCancel={handleCancel}
          />
        )}

        {/* Output */}
        {outputUrl && (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                ✅ Video processed successfully!
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-black p-2 dark:border-slate-700">
              <video
                src={outputUrl}
                controls
                className="mx-auto max-h-[400px] w-full rounded-lg"
              />
            </div>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Processed Video
            </button>
          </div>
        )}

        {/* Process Button */}
        {!processing && !outputUrl && (
          <button
            onClick={handleProcess}
            disabled={!videoFile || !srtFile}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Play className="h-4 w-4" />
            Start Processing
          </button>
        )}
      </div>
    </div>
  );
}
