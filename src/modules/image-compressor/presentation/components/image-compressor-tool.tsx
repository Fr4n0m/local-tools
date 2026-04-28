"use client";

import NextImage from "next/image";
import { useEffect, useMemo, useState } from "react";

import en from "@/modules/image-compressor/presentation/i18n/en.json";
import es from "@/modules/image-compressor/presentation/i18n/es.json";
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

export function ImageCompressorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState("");
  const qualityPercent = Math.round(quality * 100);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      if (originalPreviewUrl) {
        URL.revokeObjectURL(originalPreviewUrl);
      }
    };
  }, [downloadUrl, originalPreviewUrl]);

  const compressToBlob = async (file: File): Promise<Blob | null> => {
    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);
    image.src = sourceUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => {
        URL.revokeObjectURL(sourceUrl);
        resolve();
      };
      image.onerror = () => {
        URL.revokeObjectURL(sourceUrl);
        reject(new Error("image-load-error"));
      };
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }
    context.drawImage(image, 0, 0);

    const compressibleType =
      file.type === "image/png" || file.type === "image/jpeg"
        ? file.type
        : "image/jpeg";

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, compressibleType, quality);
    });
    return blob;
  };

  const onCompress = async () => {
    if (files.length === 0) return;
    const blob = await compressToBlob(files[0]);
    if (!blob) return;

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(URL.createObjectURL(blob));
  };

  const onCompressBatch = async () => {
    if (files.length <= 1) return;

    const compressed = await Promise.all(
      files.map(async (file) => {
        const blob = await compressToBlob(file);
        if (!blob) return null;
        const dotIndex = file.name.lastIndexOf(".");
        const basename =
          dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
        const ext = blob.type === "image/png" ? "png" : "jpg";
        return { name: `${basename}-compressed.${ext}`, blob };
      }),
    );

    const zipBlob = await createZipBlob(
      compressed.filter((item): item is { name: string; blob: Blob } => !!item),
    );
    downloadBlob(zipBlob, "compressed-images.zip");
  };

  const onDropFiles = (nextFiles: File[]) => {
    const validFiles = nextFiles.filter((file) =>
      file.type.startsWith("image/"),
    );
    if (validFiles.length === 0) return;

    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }
    setOriginalPreviewUrl(URL.createObjectURL(validFiles[0]));
    setFiles(validFiles);
  };

  return (
    <ToolSection title={text.title}>
      <ToolFileDrop
        accept="image/*"
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
            label: text.compress,
            onClick: () => {
              void onCompress();
            },
            disabled: files.length === 0,
          },
          {
            label: text.compressBatch,
            onClick: () => {
              void onCompressBatch();
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
            },
            disabled: files.length === 0 && !downloadUrl,
          },
        ]}
      />

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
            <p className="text-sm">{text.compressedPreview}</p>
            {downloadUrl ? (
              <NextImage
                alt={text.compressedPreview}
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
          download={`compressed-${files[0]?.name ?? "image"}.jpg`}
        >
          {text.done}
        </a>
      ) : (
        <p className="text-sm">{text.empty}</p>
      )}
    </ToolSection>
  );
}
