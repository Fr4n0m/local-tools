"use client";

import { useMemo, useState } from "react";

import {
  generateColorRange,
  toCssVariables,
  toTailwindPalette,
  type ColorRangeMode,
} from "@/modules/color-range/domain/color-range";
import en from "@/modules/color-range/presentation/i18n/en.json";
import es from "@/modules/color-range/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { sanitizeIntInput } from "@/shared/lib/safe-input";
import {
  AnimatedLayoutGroup,
  AnimatedLayoutItem,
} from "@/shared/presentation/components/animated-layout";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolColorPicker,
  ToolField,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
  ToolSelect,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

type ExportFormat = "css" | "tailwind";

const DEFAULT_BASE = "#3b82f6";
const DEFAULT_NAME = "brand";
const DEFAULT_STEPS = 9;

function getTextColor(hex: string) {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 150 ? "#111111" : "#ffffff";
}

export function ColorRangeTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [baseColor, setBaseColor] = useState(DEFAULT_BASE);
  const [scaleName, setScaleName] = useState(DEFAULT_NAME);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [mode, setMode] = useState<ColorRangeMode>("balanced");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");

  const colors = useMemo(
    () => generateColorRange(baseColor, steps, mode),
    [baseColor, mode, steps],
  );
  const cssVariables = useMemo(
    () => toCssVariables(scaleName, colors),
    [scaleName, colors],
  );
  const tailwindPalette = useMemo(
    () => toTailwindPalette(scaleName, colors),
    [scaleName, colors],
  );
  const output = exportFormat === "css" ? cssVariables : tailwindPalette;

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <ToolField htmlFor="color-range-base" label={text.baseColor}>
              <ToolColorPicker onChange={setBaseColor} value={baseColor} />
            </ToolField>
            <ToolField htmlFor="color-range-name" label={text.scaleName}>
              <ToolInput
                id="color-range-name"
                onChange={(event) => setScaleName(event.target.value)}
                placeholder="brand"
                value={scaleName}
              />
            </ToolField>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ToolField htmlFor="color-range-steps" label={text.steps}>
              <ToolInput
                id="color-range-steps"
                max={11}
                min={3}
                onChange={(event) =>
                  setSteps(
                    sanitizeIntInput(event.target.value, DEFAULT_STEPS, 3, 11),
                  )
                }
                step={2}
                type="number"
                value={steps}
              />
            </ToolField>
            <ToolField label={text.modeLabel}>
              <ToolSelect
                aria-label={text.modeLabel}
                onChange={(value) => setMode(value as ColorRangeMode)}
                options={[
                  { value: "balanced", label: text.modeBalanced },
                  { value: "tints", label: text.modeTints },
                  { value: "shades", label: text.modeShades },
                ]}
                value={mode}
              />
            </ToolField>
          </div>

          <ToolField label={text.exportLabel}>
            <ToolSelect
              aria-label={text.exportLabel}
              onChange={(value) => setExportFormat(value as ExportFormat)}
              options={[
                { value: "css", label: text.exportCss },
                { value: "tailwind", label: text.exportTailwind },
              ]}
              value={exportFormat}
            />
          </ToolField>

          <ToolActions
            actions={[
              {
                label:
                  exportFormat === "css" ? text.copyCss : text.copyTailwind,
                onClick: () => {
                  void copyTextToClipboard(output);
                },
              },
              {
                label: sharedText.buttons.clear,
                onClick: () => {
                  setBaseColor(DEFAULT_BASE);
                  setScaleName(DEFAULT_NAME);
                  setSteps(DEFAULT_STEPS);
                  setMode("balanced");
                  setExportFormat("css");
                },
              },
            ]}
          />
        </div>

        <div className="space-y-4">
          {colors.length === 0 ? (
            <p className="text-sm text-muted-foreground">{text.empty}</p>
          ) : (
            <>
              <div className="rounded-2xl border bg-background/40 p-4">
                <p className="mb-3 text-sm font-medium">{text.previewStrip}</p>
                <div className="flex h-12 overflow-hidden rounded-xl border">
                  {colors.map((item) => (
                    <div
                      key={`${item.step}-${item.hex}-strip`}
                      style={{
                        backgroundColor: item.hex,
                        width: `${100 / colors.length}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <AnimatedLayoutGroup className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {colors.map((item) => (
                  <AnimatedLayoutItem
                    className="rounded-xl border border-border/70 p-3 shadow-[4px_4px_0_var(--surface-shadow-color)] dark:border-white/18"
                    key={`${item.step}-${item.hex}`}
                    style={{
                      backgroundColor: item.hex,
                      color: getTextColor(item.hex),
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-75">
                      {item.step}
                    </p>
                    <p className="mt-4 text-xl font-black">{item.hex}</p>
                    <p className="mt-1 text-xs opacity-80">{`${scaleName || "palette"}-${item.step}`}</p>
                  </AnimatedLayoutItem>
                ))}
              </AnimatedLayoutGroup>

              <ToolOutputBlock
                label={
                  exportFormat === "css"
                    ? text.outputLabel
                    : text.outputTailwindLabel
                }
                value={output}
              />
            </>
          )}
        </div>
      </div>
    </ToolSection>
  );
}
