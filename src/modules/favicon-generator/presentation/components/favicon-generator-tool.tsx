"use client";

import { useMemo, useState } from "react";

import en from "@/modules/favicon-generator/presentation/i18n/en.json";
import es from "@/modules/favicon-generator/presentation/i18n/es.json";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };

type GeneratedIcon = {
  size: number;
  url: string;
};

const sizes = [16, 32, 48, 64, 128, 180, 192, 256, 512];

export function FaviconGeneratorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [file, setFile] = useState<File | null>(null);
  const [generated, setGenerated] = useState<GeneratedIcon[]>([]);

  const onGenerate = async () => {
    if (!file) {
      return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("image-load-error"));
    });

    const icons: GeneratedIcon[] = [];
    for (const size of sizes) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) {
        continue;
      }
      context.drawImage(image, 0, 0, size, size);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });
      if (!blob) {
        continue;
      }
      icons.push({ size, url: URL.createObjectURL(blob) });
    }

    setGenerated(icons);
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
      <button className="neu-button" onClick={onGenerate} type="button">
        {text.generate}
      </button>
      {generated.length === 0 ? (
        <p className="text-sm">{text.empty}</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">{text.result}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {generated.map((icon) => (
              <a
                className="flex items-center justify-between rounded-md border p-3 text-sm"
                download={`favicon-${icon.size}.png`}
                href={icon.url}
                key={icon.size}
              >
                <span>
                  {icon.size}x{icon.size}
                </span>
                <span>PNG</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
