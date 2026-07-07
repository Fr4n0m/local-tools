"use client";

import { useMemo, useState } from "react";
import {
  IconCopy,
  IconDropletHalf2,
  IconPalette,
  IconVariable,
} from "@tabler/icons-react";
import NextImage from "next/image";

import {
  extractPalette,
  paletteToCssVariables,
  withPaletteShare,
} from "@/modules/fetch-colors/domain/fetch-colors";
import en from "@/modules/fetch-colors/presentation/i18n/en.json";
import es from "@/modules/fetch-colors/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { sanitizeIntInput } from "@/shared/lib/safe-input";
import { ToolDropSurface } from "@/shared/presentation/components/tool-drop-surface";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolFileDrop,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

const DEFAULT_MAX_COLORS = 8;

function getTextColor(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 150 ? "#111111" : "#ffffff";
}

export function FetchColorsTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [maxColors, setMaxColors] = useState(DEFAULT_MAX_COLORS);
  const [colors, setColors] = useState<Array<{ hex: string; count: number }>>(
    [],
  );

  const colorsWithShare = useMemo(() => withPaletteShare(colors), [colors]);
  const cssVariables = useMemo(
    () => paletteToCssVariables(colors, "palette"),
    [colors],
  );

  const reset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setColors([]);
    setError("");
    setMaxColors(DEFAULT_MAX_COLORS);
  };

  const selectFile = (files: File[]) => {
    const selected = files[0];
    if (!selected || !selected.type.startsWith("image/")) {
      reset();
      setError(text.invalid);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setError("");
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setColors([]);
  };

  const extract = async () => {
    if (!file || !previewUrl) return;

    try {
      const image = new Image();
      image.src = previewUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Invalid image"));
      });

      const canvas = document.createElement("canvas");
      const maxWidth = 280;
      const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));

      const context = canvas.getContext("2d");
      if (!context) {
        setError(text.invalid);
        setColors([]);
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      setColors(extractPalette(imageData.data, maxColors));
      setError("");
    } catch {
      setError(text.invalid);
      setColors([]);
    }
  };

  return (
    <ToolSection title={text.title}>
      <ToolDropSurface
        dropHint={text.dropHint}
        label={text.inputLabel}
        onSelectFiles={selectFile}
      >
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <ToolFileDrop
              accept="image/*"
              currentFileText={file ? file.name : null}
              dropHint={text.dropHint}
              inputAriaLabel={text.inputLabel}
              label={text.inputLabel}
              onSelectFiles={selectFile}
            />

            <ToolField htmlFor="fetch-colors-max" label={text.maxColors}>
              <ToolInput
                id="fetch-colors-max"
                max={16}
                min={1}
                onChange={(event) =>
                  setMaxColors(
                    sanitizeIntInput(
                      event.target.value,
                      DEFAULT_MAX_COLORS,
                      1,
                      16,
                    ),
                  )
                }
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
                  icon: <IconPalette size={16} />,
                },
                {
                  label: text.copyHex,
                  onClick: () => {
                    void copyTextToClipboard(
                      colors.map((item) => item.hex).join("\n"),
                    );
                  },
                  disabled: colors.length === 0,
                  icon: <IconCopy size={16} />,
                },
                {
                  label: text.copyCss,
                  onClick: () => {
                    void copyTextToClipboard(cssVariables);
                  },
                  disabled: colors.length === 0,
                  icon: <IconVariable size={16} />,
                },
                {
                  label: sharedText.buttons.clear,
                  onClick: reset,
                  disabled: !file && colors.length === 0,
                },
              ]}
            />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            {previewUrl ? (
              <div className="rounded-2xl border bg-background/40 p-3">
                <p className="mb-3 text-sm font-medium">{text.preview}</p>
                <div className="overflow-hidden rounded-xl border bg-background/70">
                  <div className="relative aspect-[4/3] w-full">
                    <NextImage
                      alt={file?.name ?? text.preview}
                      className="object-contain"
                      fill
                      src={previewUrl}
                      sizes="(max-width: 1280px) 100vw, 40vw"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            {colorsWithShare.length === 0 ? (
              <p className="text-sm text-muted-foreground">{text.empty}</p>
            ) : (
              <>
                <div className="rounded-2xl border bg-background/40 p-4">
                  <p className="mb-3 text-sm font-medium">
                    {text.paletteStrip}
                  </p>
                  <div className="flex h-12 overflow-hidden rounded-xl border">
                    {colorsWithShare.map((item) => (
                      <div
                        key={`${item.hex}-strip`}
                        style={{
                          backgroundColor: item.hex,
                          width: `${Math.max(item.share, 6)}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {colorsWithShare.map((item, index) => (
                    <button
                      className="rounded-2xl border bg-background/55 p-3 text-left transition-colors hover:bg-background/80"
                      key={item.hex}
                      onClick={() => {
                        void copyTextToClipboard(item.hex);
                      }}
                      type="button"
                    >
                      <div
                        className="flex min-h-28 flex-col justify-between rounded-xl border p-3 shadow-sm"
                        style={{
                          backgroundColor: item.hex,
                          color: getTextColor(item.hex),
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                          <span>{text.color}</span>
                          <span>#{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-lg font-black">{item.hex}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs font-medium opacity-85">
                            <span className="inline-flex items-center gap-1">
                              <IconDropletHalf2 size={14} />
                              {item.share}%
                            </span>
                            <span>{item.count}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <ToolOutputBlock
                  label={text.outputLabel}
                  value={cssVariables}
                />
              </>
            )}
          </div>
        </div>
      </ToolDropSurface>
    </ToolSection>
  );
}
