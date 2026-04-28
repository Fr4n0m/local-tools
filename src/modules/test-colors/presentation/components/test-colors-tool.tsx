"use client";

import { useMemo, useState } from "react";

import { computeContrastUseCase } from "@/modules/contrast-checker/application/compute-contrast-use-case";
import {
  buildColorPairs,
  parseColorList,
} from "@/modules/test-colors/domain/test-colors";
import en from "@/modules/test-colors/presentation/i18n/en.json";
import es from "@/modules/test-colors/presentation/i18n/es.json";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolSection,
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

  const colors = useMemo(() => parseColorList(analyzedInput), [analyzedInput]);
  const pairs = useMemo(() => buildColorPairs(colors), [colors]);
  const rows = useMemo(
    () =>
      pairs
        .map((pair) => {
          const result = computeContrastUseCase(
            pair.foreground,
            pair.background,
          );
          if (!result.ok) return null;
          return {
            ...pair,
            ratio: result.value.ratio.toFixed(2),
            aa: result.value.aaNormal,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => Number(a.ratio) - Number(b.ratio))
        .slice(0, 30),
    [pairs],
  );

  return (
    <ToolSection title={text.title}>
      <ToolField htmlFor="test-colors-input" label={text.inputLabel}>
        <ToolTextarea
          className="h-40"
          id="test-colors-input"
          onChange={(event) => setInput(event.target.value)}
          placeholder={text.inputPlaceholder}
          value={input}
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

      {colors.length < 2 ? (
        <p className="text-sm text-muted-foreground">{text.empty}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm">{text.results}</p>
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                className="flex items-center justify-between rounded-md border bg-background/40 px-3 py-2 text-sm"
                key={`${row.foreground}-${row.background}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-4 w-4 rounded-sm border"
                    style={{ backgroundColor: row.foreground }}
                  />
                  <span
                    className="inline-block h-4 w-4 rounded-sm border"
                    style={{ backgroundColor: row.background }}
                  />
                  <span>{`${row.foreground} / ${row.background}`}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{`${text.ratio}: ${row.ratio}`}</span>
                  <span
                    className={row.aa ? "text-emerald-500" : "text-rose-500"}
                  >
                    {`${text.aa}: ${row.aa ? "OK" : "NO"}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolSection>
  );
}
