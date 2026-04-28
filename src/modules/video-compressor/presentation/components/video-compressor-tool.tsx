"use client";

import { useMemo, useRef, useState } from "react";

import {
  bestRecorderMimeType,
  clampBitrateKbps,
  compressedVideoName,
  isVideoFile,
} from "@/modules/video-compressor/domain/video-compressor";
import en from "@/modules/video-compressor/presentation/i18n/en.json";
import es from "@/modules/video-compressor/presentation/i18n/es.json";
import { downloadBlob } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolFileDrop,
  ToolSection,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function VideoCompressorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const shared = sharedMessages[language];
  const [file, setFile] = useState<File | null>(null);
  const [bitrateKbps, setBitrateKbps] = useState(1200);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const compress = async () => {
    if (!file || !videoRef.current) return;
    setIsRunning(true);
    setError("");
    setResult(null);

    const url = URL.createObjectURL(file);

    try {
      const video = videoRef.current;
      video.src = url;
      video.muted = true;
      await video.play();

      const streamFactory =
        (
          video as HTMLVideoElement & {
            captureStream?: () => MediaStream;
            mozCaptureStream?: () => MediaStream;
          }
        ).captureStream ??
        (
          video as HTMLVideoElement & {
            mozCaptureStream?: () => MediaStream;
          }
        ).mozCaptureStream;
      if (!streamFactory) {
        throw new Error("Stream capture not supported");
      }
      const stream = streamFactory.call(video);
      const mimeType = bestRecorderMimeType();
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: clampBitrateKbps(bitrateKbps) * 1000,
      });

      const done = new Promise<Blob>((resolve) => {
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      });

      recorder.start(500);
      await new Promise<void>((resolve) => {
        video.onended = () => resolve();
      });
      recorder.stop();

      const output = await done;
      setResult(output);
    } catch {
      setError(text.invalid);
    } finally {
      URL.revokeObjectURL(url);
      setIsRunning(false);
    }
  };

  return (
    <ToolSection title={text.title}>
      <ToolFileDrop
        accept="video/*"
        currentFileText={file ? file.name : null}
        dropHint={text.dropHint}
        inputAriaLabel={text.input}
        label={text.input}
        onSelectFiles={(files) => {
          const selected = files[0];
          if (!selected || !isVideoFile(selected)) {
            setFile(null);
            setResult(null);
            setError(text.invalid);
            return;
          }
          setFile(selected);
          setError("");
          setResult(null);
        }}
      />

      <ToolField label={text.bitrate}>
        <input
          className="w-full rounded-md border bg-background/40 p-3"
          max={6000}
          min={300}
          onChange={(event) => setBitrateKbps(Number(event.target.value))}
          type="number"
          value={bitrateKbps}
        />
      </ToolField>

      <video className="hidden" ref={videoRef} />

      <ToolActions
        actions={[
          {
            label: isRunning ? "..." : text.compress,
            onClick: () => {
              void compress();
            },
            disabled: !file || isRunning,
          },
          {
            label: text.download,
            onClick: () => {
              if (!result || !file) return;
              downloadBlob(result, compressedVideoName(file.name));
            },
            disabled: !result || !file || isRunning,
          },
          {
            label: shared.buttons.clear,
            onClick: () => {
              setFile(null);
              setResult(null);
              setError("");
            },
            disabled: !file && !result && !error,
          },
        ]}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {result ? <p className="text-sm text-emerald-500">{text.done}</p> : null}
    </ToolSection>
  );
}
