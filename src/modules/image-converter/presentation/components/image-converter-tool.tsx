"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  convertImageFile,
  convertedFileName,
  type ConvertImageOptions,
  type OutputFormat,
} from "@/modules/image-converter/domain/image-converter";
import en from "@/modules/image-converter/presentation/i18n/en.json";
import es from "@/modules/image-converter/presentation/i18n/es.json";
import { downloadBlob } from "@/shared/lib/download";
import { createZipBlob } from "@/shared/lib/zip";
import { CameraDownloadButton } from "@/shared/presentation/components/camera-download-button";
import { ImageCompareWorkbench } from "@/shared/presentation/components/image-compare-workbench";
import { ToolDropSurface } from "@/shared/presentation/components/tool-drop-surface";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolFileDrop,
  ToolInput,
  ToolSection,
  ToolSelect,
  ToolSlider,
  ToolSwitch,
  ToolToggleField,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };
type ProcessingMode = "single" | "batch" | null;
type ConversionResult = {
  blob: Blob;
  previewUrl: string;
  filename: string;
  key: string;
};
type ImageDimensions = {
  width: number;
  height: number;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function sanitizeDimension(
  value: number | undefined,
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.max(1, Math.round(value));
}

async function renderPreviewDataUrl(
  file: File,
  format: OutputFormat,
  options?: ConvertImageOptions,
): Promise<string> {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("preview-load-error"));
      nextImage.src = sourceUrl;
    });

    const width = sanitizeDimension(
      options?.width,
      image.naturalWidth || image.width,
    );
    const height = sanitizeDimension(
      options?.height,
      image.naturalHeight || image.height,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("preview-canvas-unavailable");

    if (format === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

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
  const [outputDimensions, setOutputDimensions] =
    useState<ImageDimensions | null>(null);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const previewUrlRef = useRef("");
  const sourceDimensionsRef = useRef<ImageDimensions | null>(null);
  const qualityPercent = Math.round(quality * 100);
  const isBusy = processing !== null;
  const qualityDisabled = format === "image/png" || format === "image/qoi";
  const originalSize = files[0]?.size ?? 0;
  const convertedSize = result?.blob.size ?? 0;
  const savedBytes = Math.max(0, originalSize - convertedSize);
  const savedPercent =
    originalSize > 0 && result
      ? Math.max(0, Math.round((savedBytes / originalSize) * 100))
      : 0;
  const conversionOptions: ConvertImageOptions | undefined = outputDimensions
    ? {
        width: outputDimensions.width,
        height: outputDimensions.height,
      }
    : undefined;

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const clearResult = () => {
    setResult(null);
  };

  const onConvert = async () => {
    const file = files[0];
    if (!file || isBusy) return;
    setProcessing("single");
    setError("");
    try {
      const [blob, previewUrl] = await Promise.all([
        convertImageFile(file, format, quality, conversionOptions),
        renderPreviewDataUrl(file, format, conversionOptions),
      ]);
      clearResult();
      setResult({
        blob,
        previewUrl,
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
          blob: await convertImageFile(
            file,
            format,
            quality,
            conversionOptions,
          ),
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
    const image = new Image();
    image.onload = () => {
      const nextDimensions = {
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      };
      sourceDimensionsRef.current = nextDimensions;
      setOutputDimensions(nextDimensions);
    };
    image.src = previewUrl;
  };

  const clearAll = () => {
    clearResult();
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
    setOriginalPreviewUrl("");
    setFiles([]);
    setError("");
    sourceDimensionsRef.current = null;
    setOutputDimensions(null);
    setKeepAspectRatio(true);
  };

  const onWidthChange = (value: number) => {
    if (!outputDimensions) return;
    const nextWidth = sanitizeDimension(
      value,
      sourceDimensionsRef.current?.width ?? outputDimensions.width,
    );
    clearResult();
    if (keepAspectRatio && sourceDimensionsRef.current) {
      const ratio =
        sourceDimensionsRef.current.width / sourceDimensionsRef.current.height;
      setOutputDimensions({
        width: nextWidth,
        height: Math.max(1, Math.round(nextWidth / ratio)),
      });
      return;
    }
    setOutputDimensions({ ...outputDimensions, width: nextWidth });
  };

  const onHeightChange = (value: number) => {
    if (!outputDimensions) return;
    const nextHeight = sanitizeDimension(
      value,
      sourceDimensionsRef.current?.height ?? outputDimensions.height,
    );
    clearResult();
    if (keepAspectRatio && sourceDimensionsRef.current) {
      const ratio =
        sourceDimensionsRef.current.width / sourceDimensionsRef.current.height;
      setOutputDimensions({
        width: Math.max(1, Math.round(nextHeight * ratio)),
        height: nextHeight,
      });
      return;
    }
    setOutputDimensions({ ...outputDimensions, height: nextHeight });
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
                { value: "image/avif", label: "AVIF" },
                { value: "image/jxl", label: "JPEG XL" },
                { value: "image/qoi", label: "QOI" },
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
              disabled={qualityDisabled || isBusy}
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
            {qualityDisabled ? (
              <p className="mt-1 text-xs text-foreground/65">
                {format === "image/qoi"
                  ? text.qualityUnavailableQoi
                  : text.qualityUnavailable}
              </p>
            ) : null}
          </ToolField>
        </div>

        {outputDimensions ? (
          <div className="space-y-3 rounded-xl border bg-background/45 p-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-foreground/85">
                {text.resizeTitle}
              </p>
              <ToolToggleField
                className="border-0 bg-transparent p-0"
                label={text.keepAspectRatio}
              >
                <ToolSwitch
                  aria-label={text.keepAspectRatio}
                  checked={keepAspectRatio}
                  onChange={(checked) => {
                    setKeepAspectRatio(checked);
                    if (checked && sourceDimensionsRef.current) {
                      setOutputDimensions((current) => {
                        if (!current) return current;
                        const nextHeight = Math.max(
                          1,
                          Math.round(
                            current.width *
                              (sourceDimensionsRef.current!.height /
                                sourceDimensionsRef.current!.width),
                          ),
                        );
                        return {
                          width: current.width,
                          height: nextHeight,
                        };
                      });
                    }
                    clearResult();
                  }}
                />
              </ToolToggleField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ToolField label={text.outputWidth}>
                <ToolInput
                  min={1}
                  onChange={(event) =>
                    onWidthChange(Number(event.target.value))
                  }
                  type="number"
                  value={outputDimensions.width}
                />
              </ToolField>
              <ToolField label={text.outputHeight}>
                <ToolInput
                  min={1}
                  onChange={(event) =>
                    onHeightChange(Number(event.target.value))
                  }
                  type="number"
                  value={outputDimensions.height}
                />
              </ToolField>
            </div>
          </div>
        ) : null}

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
          <div className="space-y-4">
            <ImageCompareWorkbench
              compareLabel={text.compareSlider}
              emptyText={text.notConverted}
              originalLabel={text.originalPreview}
              originalUrl={originalPreviewUrl}
              resetViewLabel={text.resetView}
              resultLabel={text.convertedPreview}
              resultUrl={result?.previewUrl}
              zoomLabel={text.zoom}
            />

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-background/45 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/52">
                  {text.originalSize}
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {formatBytes(originalSize)}
                </p>
              </div>
              <div className="rounded-xl border bg-background/45 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/52">
                  {text.convertedSize}
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {result ? formatBytes(convertedSize) : text.pendingMetric}
                </p>
              </div>
              <div className="rounded-xl border bg-background/45 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/52">
                  {text.savedSize}
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {result
                    ? `${formatBytes(savedBytes)} · ${savedPercent}%`
                    : text.pendingMetric}
                </p>
              </div>
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
              imageUrl={result?.previewUrl}
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
