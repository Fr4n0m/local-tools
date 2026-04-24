"use client";

import NextImage from "next/image";
import { useEffect, useMemo, useState } from "react";

import en from "@/modules/image-converter/presentation/i18n/en.json";
import es from "@/modules/image-converter/presentation/i18n/es.json";
import { downloadBlob } from "@/shared/lib/download";
import { createZipBlob } from "@/shared/lib/zip";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };
type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

export function ImageConverterTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(0.9);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState("");

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

  const convertFileToBlob = async (file: File): Promise<Blob | null> => {
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

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, format, quality);
    });

    return blob;
  };

  const onConvert = async () => {
    if (files.length === 0) {
      return;
    }

    const blob = await convertFileToBlob(files[0]);
    if (!blob) {
      return;
    }

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setDownloadUrl(URL.createObjectURL(blob));
  };

  const onConvertBatch = async () => {
    if (files.length <= 1) {
      return;
    }

    const converted = await Promise.all(
      files.map(async (file) => {
        const blob = await convertFileToBlob(file);
        if (!blob) {
          return null;
        }
        const dotIndex = file.name.lastIndexOf(".");
        const basename =
          dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
        const ext = format.split("/")[1];
        return {
          name: `${basename}.${ext}`,
          blob,
        };
      }),
    );

    const zipBlob = await createZipBlob(
      converted.filter((item): item is { name: string; blob: Blob } => !!item),
    );
    downloadBlob(zipBlob, "converted-images.zip");
  };

  const onDropFiles = (nextFiles: File[]) => {
    const validFiles = nextFiles.filter((nextFile) =>
      nextFile.type.startsWith("image/"),
    );
    if (validFiles.length === 0) {
      return;
    }

    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }
    setOriginalPreviewUrl(URL.createObjectURL(validFiles[0]));
    setFiles(validFiles);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.inputLabel}</span>
        <div
          className={`rounded-md border p-3 ${isDragging ? "bg-secondary/40" : "bg-background/50"}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            onDropFiles(Array.from(event.dataTransfer.files ?? []));
          }}
        >
          <input
            className="w-full rounded-md border bg-background/60 p-3"
            type="file"
            multiple
            accept="image/*"
            onChange={(event) =>
              onDropFiles(Array.from(event.target.files ?? []))
            }
          />
          <p className="mt-2 text-xs">{text.dropHint}</p>
          {files.length > 0 ? (
            <p className="mt-1 text-xs">
              {text.currentFile}: {files[0].name}
            </p>
          ) : null}
          {files.length > 1 ? (
            <p className="mt-1 text-xs">
              {text.selectedCount.replace("{count}", String(files.length))}
            </p>
          ) : null}
        </div>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm">{text.formatLabel}</span>
          <select
            className="w-full rounded-md border bg-background/50 p-3"
            value={format}
            onChange={(event) => setFormat(event.target.value as OutputFormat)}
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm">{text.qualityLabel}</span>
          <input
            className="w-full"
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
          />
        </label>
      </div>
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
              if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
              }
              if (originalPreviewUrl) {
                URL.revokeObjectURL(originalPreviewUrl);
              }
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
          download={`converted-${files[0]?.name ?? "image"}.${format.split("/")[1]}`}
        >
          {text.done}
        </a>
      ) : (
        <p className="text-sm">{text.empty}</p>
      )}
    </div>
  );
}
