"use client";

import { useMemo, useState } from "react";

import en from "@/modules/image-converter/presentation/i18n/en.json";
import es from "@/modules/image-converter/presentation/i18n/es.json";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };
type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

export function ImageConverterTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(0.9);
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  const onConvert = async () => {
    if (!file) {
      return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("image-load-error"));
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.inputLabel}</span>
        <input
          className="w-full rounded-md border bg-background/50 p-3"
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
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
      <button className="neu-button" onClick={onConvert} type="button">
        {text.convert}
      </button>
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
