"use client";

import { useMemo, useState } from "react";
import {
  IconArrowsExchange,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";

import { computeContrastUseCase } from "@/modules/contrast-checker/application/compute-contrast-use-case";
import en from "@/modules/contrast-checker/presentation/i18n/en.json";
import es from "@/modules/contrast-checker/presentation/i18n/es.json";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolColorPicker,
  ToolField,
  ToolInput,
  ToolSection,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };

const DEFAULT_FOREGROUND = "#111111";
const DEFAULT_BACKGROUND = "#ffffff";

function statusTone(ratio: number, text: typeof en) {
  if (ratio >= 7)
    return {
      label: text.excellent,
      className: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    };
  if (ratio >= 4.5)
    return {
      label: text.good,
      className: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
    };
  return {
    label: text.poor,
    className: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
  };
}

function ComplianceBadge({
  label,
  passed,
  passLabel,
  failLabel,
}: {
  label: string;
  passed: boolean;
  passLabel: string;
  failLabel: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-background/55 px-3 py-2 text-sm">
      <span className="text-foreground/85">{label}</span>
      <span
        className={
          passed
            ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-1 text-emerald-600 dark:text-emerald-300"
            : "inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-1 text-rose-600 dark:text-rose-300"
        }
      >
        {passed ? <IconCircleCheck size={14} /> : <IconCircleX size={14} />}
        {passed ? passLabel : failLabel}
      </span>
    </div>
  );
}

export function ContrastCheckerTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [foreground, setForeground] = useState(DEFAULT_FOREGROUND);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);

  const result = useMemo(
    () => computeContrastUseCase(foreground, background),
    [foreground, background],
  );

  const reset = () => {
    setForeground(DEFAULT_FOREGROUND);
    setBackground(DEFAULT_BACKGROUND);
  };

  const swapColors = () => {
    setForeground(background);
    setBackground(foreground);
  };

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ToolField label={text.foreground}>
              <div className="space-y-2">
                <ToolInput
                  value={foreground}
                  onChange={(event) => setForeground(event.target.value)}
                />
                <ToolColorPicker onChange={setForeground} value={foreground} />
              </div>
            </ToolField>

            <ToolField label={text.background}>
              <div className="space-y-2">
                <ToolInput
                  value={background}
                  onChange={(event) => setBackground(event.target.value)}
                />
                <ToolColorPicker onChange={setBackground} value={background} />
              </div>
            </ToolField>
          </div>

          <ToolActions
            actions={[
              {
                label: text.swapColors,
                onClick: swapColors,
                icon: <IconArrowsExchange size={16} />,
              },
              {
                label: text.reset,
                onClick: reset,
                disabled:
                  foreground === DEFAULT_FOREGROUND &&
                  background === DEFAULT_BACKGROUND,
              },
            ]}
          />

          <div className="rounded-2xl border bg-background/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{text.previewTitle}</p>
              {result.ok ? (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(result.value.ratio, text).className}`}
                >
                  {statusTone(result.value.ratio, text).label}
                </span>
              ) : null}
            </div>

            <div
              className="rounded-2xl border border-black/10 p-5 shadow-sm dark:border-white/10"
              style={{ color: foreground, backgroundColor: background }}
            >
              <p className="text-base font-semibold">{text.sample}</p>
              <p className="mt-2 text-sm opacity-80">{text.sampleBody}</p>
              <p className="mt-4 text-xl font-bold leading-tight">
                {text.sampleLarge}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {result.ok ? (
            <>
              <div className="rounded-2xl border bg-background/40 p-4">
                <p className="text-sm font-medium text-foreground/70">
                  {text.ratio}
                </p>
                <p className="mt-1 text-4xl font-black tracking-tight">
                  {result.value.ratio.toFixed(2)}
                  <span className="ml-1 text-lg font-semibold text-foreground/55">
                    :1
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.value.aaaNormal
                    ? text.recommendationExcellent
                    : result.value.aaNormal
                      ? text.recommendationGood
                      : text.recommendationPoor}
                </p>
              </div>

              <div className="grid gap-2">
                <ComplianceBadge
                  failLabel={text.fail}
                  label={text.aaNormal}
                  passLabel={text.pass}
                  passed={result.value.aaNormal}
                />
                <ComplianceBadge
                  failLabel={text.fail}
                  label={text.aaLarge}
                  passLabel={text.pass}
                  passed={result.value.aaLarge}
                />
                <ComplianceBadge
                  failLabel={text.fail}
                  label={text.aaaNormal}
                  passLabel={text.pass}
                  passed={result.value.aaaNormal}
                />
                <ComplianceBadge
                  failLabel={text.fail}
                  label={text.aaaLarge}
                  passLabel={text.pass}
                  passed={result.value.aaaLarge}
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/8 p-4 text-sm text-destructive">
              {text.invalid}
            </div>
          )}
        </div>
      </div>
    </ToolSection>
  );
}
