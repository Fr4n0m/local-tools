"use client";

import { useMemo, useState } from "react";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";

import { computeContrastUseCase } from "@/modules/contrast-checker/application/compute-contrast-use-case";
import {
  buildColorPairs,
  parseColorList,
  sortColorPairsByRatio,
  type TestColorsSortMode,
} from "@/modules/test-colors/domain/test-colors";
import en from "@/modules/test-colors/presentation/i18n/en.json";
import es from "@/modules/test-colors/presentation/i18n/es.json";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolSection,
  ToolSelect,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

const DEFAULT_INPUT = "#14213d\n#fca311\n#e5e5e5\n#000000";

export function TestColorsTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [analyzedInput, setAnalyzedInput] = useState(DEFAULT_INPUT);
  const [sortMode, setSortMode] = useState<TestColorsSortMode>("weakest");

  const colors = useMemo(() => parseColorList(analyzedInput), [analyzedInput]);
  const pairs = useMemo(() => buildColorPairs(colors), [colors]);
  const rows = useMemo(() => {
    const analyzedRows = pairs
      .map((pair) => {
        const result = computeContrastUseCase(pair.foreground, pair.background);
        if (!result.ok) return null;
        return {
          ...pair,
          ratio: result.value.ratio,
          aaNormal: result.value.aaNormal,
          aaLarge: result.value.aaLarge,
          aaaNormal: result.value.aaaNormal,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return sortColorPairsByRatio(analyzedRows, sortMode).slice(0, 36);
  }, [pairs, sortMode]);

  const summary = useMemo(
    () => ({
      total: rows.length,
      aaNormal: rows.filter((row) => row.aaNormal).length,
      aaaNormal: rows.filter((row) => row.aaaNormal).length,
    }),
    [rows],
  );

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <ToolField htmlFor="test-colors-input" label={text.inputLabel}>
            <ToolTextarea
              className="h-48"
              id="test-colors-input"
              onChange={(event) => setInput(event.target.value)}
              placeholder={text.inputPlaceholder}
              value={input}
            />
          </ToolField>

          <ToolField label={text.sortLabel}>
            <ToolSelect
              aria-label={text.sortLabel}
              onChange={(value) => setSortMode(value as TestColorsSortMode)}
              options={[
                { value: "weakest", label: text.sortWeakest },
                { value: "strongest", label: text.sortStrongest },
              ]}
              value={sortMode}
            />
          </ToolField>

          <ToolActions
            actions={[
              {
                label: text.analyze,
                onClick: () => setAnalyzedInput(input),
              },
              {
                label: sharedText.buttons.clear,
                onClick: () => {
                  setInput("");
                  setAnalyzedInput("");
                },
              },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-background/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                {text.totalPairs}
              </p>
              <p className="mt-2 text-3xl font-black">{summary.total}</p>
            </div>
            <div className="rounded-2xl border bg-background/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                {text.passAA}
              </p>
              <p className="mt-2 text-3xl font-black">{summary.aaNormal}</p>
            </div>
            <div className="rounded-2xl border bg-background/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                {text.passAAA}
              </p>
              <p className="mt-2 text-3xl font-black">{summary.aaaNormal}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {colors.length < 2 ? (
            <p className="text-sm text-muted-foreground">{text.empty}</p>
          ) : (
            <>
              <p className="text-sm">{text.results}</p>
              {rows.map((row) => (
                <div
                  className="rounded-2xl border bg-background/45 p-3"
                  key={`${row.foreground}-${row.background}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border text-[0.6rem] font-bold"
                        style={{
                          backgroundColor: row.foreground,
                          color: row.background,
                        }}
                      >
                        Aa
                      </span>
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border text-[0.6rem] font-bold"
                        style={{
                          backgroundColor: row.background,
                          color: row.foreground,
                        }}
                      >
                        Bg
                      </span>
                      <div className="text-sm">
                        <p className="font-semibold">{`${row.foreground} / ${row.background}`}</p>
                        <p className="text-muted-foreground">
                          {text.ratio}: {row.ratio.toFixed(2)}:1
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={
                          row.aaNormal
                            ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-1 text-emerald-600 dark:text-emerald-300"
                            : "inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-1 text-rose-600 dark:text-rose-300"
                        }
                      >
                        {row.aaNormal ? (
                          <IconCircleCheck size={14} />
                        ) : (
                          <IconCircleX size={14} />
                        )}
                        {text.aaNormal}
                      </span>
                      <span
                        className={
                          row.aaLarge
                            ? "inline-flex items-center gap-1 rounded-full bg-sky-500/12 px-2 py-1 text-sky-700 dark:text-sky-300"
                            : "inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-1 text-rose-600 dark:text-rose-300"
                        }
                      >
                        {row.aaLarge ? (
                          <IconCircleCheck size={14} />
                        ) : (
                          <IconCircleX size={14} />
                        )}
                        {text.aaLarge}
                      </span>
                      <span
                        className={
                          row.aaaNormal
                            ? "inline-flex items-center gap-1 rounded-full bg-violet-500/12 px-2 py-1 text-violet-700 dark:text-violet-300"
                            : "inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-1 text-rose-600 dark:text-rose-300"
                        }
                      >
                        {row.aaaNormal ? (
                          <IconCircleCheck size={14} />
                        ) : (
                          <IconCircleX size={14} />
                        )}
                        {text.aaaNormal}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </ToolSection>
  );
}
