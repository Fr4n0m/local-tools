"use client";

import { useMemo, useState } from "react";

import { extractPalette } from "@/modules/fetch-colors/domain/fetch-colors";
import en from "@/modules/fetch-colors/presentation/i18n/en.json";
import es from "@/modules/fetch-colors/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolFileDrop,
  ToolInput,
  ToolSection,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function FetchColorsTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [maxColors, setMaxColors] = useState(8);
  const [colors, setColors] = useState<Array<{ hex: string; count: number }>>(
    [],
  );

  const extract = async () => {
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.src = url;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Invalid image"));
      });

      const canvas = document.createElement("canvas");
      const maxWidth = 240;
      const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      setColors(extractPalette(imageData.data, maxColors));
      setError("");
      URL.revokeObjectURL(url);
    } catch {
      setError(text.invalid);
      setColors([]);
    }
  };

  return (
    <ToolSection title={text.title}>
      <ToolFileDrop
        accept="image/*"
        currentFileText={file ? file.name : null}
        dropHint={text.dropHint}
        inputAriaLabel={text.inputLabel}
        label={text.inputLabel}
        onSelectFiles={(files) => {
          const selected = files[0];
          if (!selected || !selected.type.startsWith("image/")) {
            setFile(null);
            setColors([]);
            setError(text.invalid);
            return;
          }
          setError("");
          setFile(selected);
          setColors([]);
        }}
      />

      <ToolField htmlFor="fetch-colors-max" label={text.maxColors}>
        <ToolInput
          id="fetch-colors-max"
          max={16}
          min={1}
          onChange={(event) => setMaxColors(Number(event.target.value))}
          type="number"
          value={maxColors}
        />
      </ToolField>

      <ToolActions
        actions={[
          {
            label: text.extract,
            onClick: () => {
              void extract();
            },
            disabled: !file,
          },
          {
            label: sharedText.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(
                colors.map((item) => item.hex).join("\n"),
              );
            },
            disabled: colors.length === 0,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setFile(null);
              setColors([]);
              setError("");
              setMaxColors(8);
            },
            disabled: !file && colors.length === 0,
          },
        ]}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {colors.length === 0 ? (
        <p className="text-sm text-muted-foreground">{text.empty}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {colors.map((item) => (
            <div className="rounded-md border p-2" key={item.hex}>
              <div
                className="h-10 rounded-sm border"
                style={{ backgroundColor: item.hex }}
              />
              <p className="mt-2 text-xs">{item.hex}</p>
              <p className="text-xs text-muted-foreground">{item.count}</p>
            </div>
          ))}
        </div>
      )}
    </ToolSection>
  );
}
