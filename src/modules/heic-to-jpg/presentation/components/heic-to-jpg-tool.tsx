"use client";

import NextImage from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  isHeicFilename,
  isHeicMimeType,
  toJpgName,
} from "@/modules/heic-to-jpg/domain/heic-file";
import en from "@/modules/heic-to-jpg/presentation/i18n/en.json";
import es from "@/modules/heic-to-jpg/presentation/i18n/es.json";
import { downloadBlob } from "@/shared/lib/download";
import { createZipBlob } from "@/shared/lib/zip";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolFileDrop,
  ToolSection,
  ToolSlider,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

function isHeicFile(file: File): boolean {
  return isHeicMimeType(file.type) || isHeicFilename(file.name);
}

export function HeicToJpgTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.85);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState("");
  const qualityPercent = Math.round(quality * 100);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    };
  }, [downloadUrl, originalPreviewUrl]);

  const convertToJpgBlob = async (file: File): Promise<Blob | null> => {
    try {
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality,
      });

      if (converted instanceof Blob) {
        return converted;
      }

      if (Array.isArray(converted) && converted[0] instanceof Blob) {
        return converted[0];
      }

      return null;
    } catch {
      return null;
    }
  };

  const onConvert = async () => {
    if (files.length === 0) return;
    const blob = await convertToJpgBlob(files[0]);
    if (!blob) {
      setError(text.unsupported);
      return;
    }
    setError("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(URL.createObjectURL(blob));
  };

  const onConvertBatch = async () => {
    if (files.length <= 1) return;
    const converted = await Promise.all(
      files.map(async (file) => {
        const blob = await convertToJpgBlob(file);
        if (!blob) return null;
        return { name: toJpgName(file.name), blob };
      }),
    );

    const valid = converted.filter(
      (item): item is { name: string; blob: Blob } => !!item,
    );
    if (valid.length === 0) {
      setError(text.unsupported);
      return;
    }
    setError("");
    const zipBlob = await createZipBlob(valid);
    downloadBlob(zipBlob, "heic-to-jpg.zip");
  };

  const onDropFiles = (nextFiles: File[]) => {
    const valid = nextFiles.filter(isHeicFile);
    if (valid.length === 0) {
      setError(text.unsupported);
      return;
    }
    setError("");
    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    setOriginalPreviewUrl(URL.createObjectURL(valid[0]));
    setFiles(valid);
  };

  return (
    <ToolSection title={text.title}>
      <ToolFileDrop
        accept=".heic,.heif,image/heic,image/heif"
        currentFileText={
          files.length > 0 ? `${text.currentFile}: ${files[0].name}` : null
        }
        dropHint={text.dropHint}
        extraText={
          files.length > 1
            ? text.selectedCount.replace("{count}", String(files.length))
            : null
        }
        inputAriaLabel={text.inputLabel}
        label={text.inputLabel}
        multiple
        onSelectFiles={onDropFiles}
      />

      <ToolField label={text.qualityLabel}>
        <ToolSlider
          displayValue={`${qualityPercent}%`}
          max={1}
          min={0.1}
          step={0.05}
          value={quality}
          onChange={setQuality}
        />
      </ToolField>

      <ToolActions
        actions={[
          {
            label: text.convert,
            onClick: () => {
              void onConvert();
            },
            disabled: files.length === 0,
          },
          {
            label: text.convertBatch,
            onClick: () => {
              void onConvertBatch();
            },
            disabled: files.length <= 1,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              if (downloadUrl) URL.revokeObjectURL(downloadUrl);
              if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
              setFiles([]);
              setDownloadUrl("");
              setOriginalPreviewUrl("");
              setError("");
            },
            disabled: files.length === 0 && !downloadUrl && !error,
          },
        ]}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {files.length > 0 || downloadUrl ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-md border bg-background/50 p-3">
            <p className="text-sm">{text.originalPreview}</p>
            {originalPreviewUrl ? (
              <NextImage
                alt={text.originalPreview}
                className="max-h-56 w-full rounded-md object-contain"
                height={320}
                src={originalPreviewUrl}
                unoptimized
                width={320}
              />
            ) : null}
          </div>
          <div className="space-y-2 rounded-md border bg-background/50 p-3">
            <p className="text-sm">{text.convertedPreview}</p>
            {downloadUrl ? (
              <NextImage
                alt={text.convertedPreview}
                className="max-h-56 w-full rounded-md object-contain"
                height={320}
                src={downloadUrl}
                unoptimized
                width={320}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {downloadUrl ? (
        <a
          className="inline-block rounded-md border px-4 py-2"
          href={downloadUrl}
          download={toJpgName(files[0]?.name ?? "image")}
        >
          {text.done}
        </a>
      ) : (
        <p className="text-sm">{text.empty}</p>
      )}
    </ToolSection>
  );
}
