"use client";

import NextImage from "next/image";
import { useEffect, useMemo, useState } from "react";

import en from "@/modules/image-converter/presentation/i18n/en.json";
import es from "@/modules/image-converter/presentation/i18n/es.json";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };
type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

export function ImageConverterTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [file, setFile] = useState<File | null>(null);
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

  const onConvert = async () => {
    if (!file) {
      return;
    }

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
      return;
    }

    context.drawImage(image, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, format, quality);
    });

    if (!blob) {
      return;
    }

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setDownloadUrl(URL.createObjectURL(blob));
  };

  const onDropFile = (nextFile: File | null) => {
    if (!nextFile || !nextFile.type.startsWith("image/")) {
      return;
    }
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }
    setOriginalPreviewUrl(URL.createObjectURL(nextFile));
    setFile(nextFile);
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
            onDropFile(event.dataTransfer.files?.[0] ?? null);
          }}
        >
          <input
            className="w-full rounded-md border bg-background/60 p-3"
            type="file"
            accept="image/*"
            onChange={(event) => onDropFile(event.target.files?.[0] ?? null)}
          />
          <p className="mt-2 text-xs">{text.dropHint}</p>
          {file ? (
            <p className="mt-1 text-xs">
              {text.currentFile}: {file.name}
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
            disabled: !file,
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
              setFile(null);
              setDownloadUrl("");
              setOriginalPreviewUrl("");
            },
            disabled: !file && !downloadUrl,
          },
        ]}
      />
      {file || downloadUrl ? (
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
          download={`converted.${format.split("/")[1]}`}
        >
          {text.done}
        </a>
      ) : (
        <p className="text-sm">{text.empty}</p>
      )}
    </div>
  );
}
