"use client";

import NextImage from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  convertImageFile,
  convertedFileName,
  type OutputFormat,
} from "@/modules/image-converter/domain/image-converter";
import en from "@/modules/image-converter/presentation/i18n/en.json";
import es from "@/modules/image-converter/presentation/i18n/es.json";
import { downloadBlob } from "@/shared/lib/download";
import { createZipBlob } from "@/shared/lib/zip";
import { CameraDownloadButton } from "@/shared/presentation/components/camera-download-button";
import { ToolDropSurface } from "@/shared/presentation/components/tool-drop-surface";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolFileDrop,
  ToolSection,
  ToolSelect,
  ToolSlider,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };
type ProcessingMode = "single" | "batch" | null;
type ConversionResult = {
  blob: Blob;
  url: string;
  filename: string;
  key: string;
};

export function ImageConverterTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState("");
  const [processing, setProcessing] = useState<ProcessingMode>(null);
  const [error, setError] = useState("");
  const resultUrlRef = useRef("");
  const previewUrlRef = useRef("");
  const qualityPercent = Math.round(quality * 100);
  const isBusy = processing !== null;

  useEffect(
    () => () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const clearResult = () => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = "";
    setResult(null);
  };

  const onConvert = async () => {
    const file = files[0];
    if (!file || isBusy) return;
    setProcessing("single");
    setError("");
    try {
      const blob = await convertImageFile(file, format, quality);
      clearResult();
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({
        blob,
        url,
        filename: convertedFileName(file.name, format),
        key: `${Date.now()}-${format}-${quality}`,
      });
    } catch {
      clearResult();
      setError(text.conversionError);
    } finally {
      setProcessing(null);
    }
  };

  const onConvertBatch = async () => {
    if (files.length <= 1 || isBusy) return;
    setProcessing("batch");
    setError("");
    try {
      const converted = await Promise.all(
        files.map(async (file) => ({
          name: convertedFileName(file.name, format, ""),
          blob: await convertImageFile(file, format, quality),
        })),
      );
      downloadBlob(await createZipBlob(converted), "converted-images.zip");
    } catch {
      setError(text.batchError);
    } finally {
      setProcessing(null);
    }
  };

  const onDropFiles = (nextFiles: File[]) => {
    const validFiles = nextFiles.filter((file) =>
      file.type.startsWith("image/"),
    );
    if (validFiles.length === 0) {
      setError(text.invalidImage);
      return;
    }
    clearResult();
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const previewUrl = URL.createObjectURL(validFiles[0]);
    previewUrlRef.current = previewUrl;
    setOriginalPreviewUrl(previewUrl);
    setFiles(validFiles);
    setError("");
  };

  const clearAll = () => {
    clearResult();
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
    setOriginalPreviewUrl("");
    setFiles([]);
    setError("");
  };

  return (
    <ToolSection title={text.title}>
      <ToolDropSurface
        dropHint={text.dropHint}
        label={text.inputLabel}
        onSelectFiles={onDropFiles}
      >
        <ToolFileDrop
          accept="image/*"
          currentFileText={
            files.length ? `${text.currentFile}: ${files[0].name}` : null
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

        <div className="grid gap-4 md:grid-cols-2">
          <ToolField label={text.formatLabel}>
            <ToolSelect
              aria-label={text.formatLabel}
              options={[
                { value: "image/png", label: "PNG" },
                { value: "image/jpeg", label: "JPEG" },
                { value: "image/webp", label: "WEBP" },
              ]}
              value={format}
              onChange={(value) => {
                clearResult();
                setFormat(value as OutputFormat);
              }}
            />
          </ToolField>
          <ToolField label={text.qualityLabel}>
            <ToolSlider
              disabled={format === "image/png" || isBusy}
              displayValue={`${qualityPercent}%`}
              max={1}
              min={0.1}
              step={0.05}
              value={quality}
              onChange={(value) => {
                clearResult();
                setQuality(value);
              }}
            />
            {format === "image/png" ? (
              <p className="mt-1 text-xs text-foreground/65">
                {text.qualityUnavailable}
              </p>
            ) : null}
          </ToolField>
        </div>

        <ToolActions
          actions={[
            {
              label:
                processing === "batch"
                  ? text.batchConverting
                  : text.convertBatch,
              onClick: () => void onConvertBatch(),
              disabled: files.length <= 1 || isBusy,
            },
            {
              label: sharedText.buttons.clear,
              onClick: clearAll,
              disabled: (files.length === 0 && !result) || isBusy,
            },
          ]}
        />

        {files.length > 0 ? (
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
              {result ? (
                <NextImage
                  alt={text.convertedPreview}
                  className="max-h-56 w-full rounded-md object-contain"
                  height={320}
                  src={result.url}
                  unoptimized
                  width={320}
                />
              ) : (
                <p className="text-xs text-foreground/65">
                  {text.notConverted}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm">{text.empty}</p>
        )}

        {files.length > 0 ? (
          <div className="flex min-h-36 flex-wrap items-start gap-5 pb-3">
            <CameraDownloadButton
              busy={processing === "single"}
              convertLabel={
                processing === "single" ? text.converting : text.convert
              }
              disabled={isBusy}
              downloadLabel={text.downloadResult}
              imageAlt={text.convertedPreview}
              imageUrl={result?.url}
              onConvert={() => void onConvert()}
              onDownload={() =>
                result && downloadBlob(result.blob, result.filename)
              }
              resultKey={result?.key}
            />
            <div className="max-w-56 space-y-1 pt-2">
              <p className="text-sm font-semibold">{text.cameraActionTitle}</p>
              <p className="text-xs leading-5 text-foreground/65">
                {result ? text.photoDownloadHint : text.cameraActionHint}
              </p>
            </div>
          </div>
        ) : null}
        {error ? (
          <p
            aria-live="polite"
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </ToolDropSurface>
    </ToolSection>
  );
}
