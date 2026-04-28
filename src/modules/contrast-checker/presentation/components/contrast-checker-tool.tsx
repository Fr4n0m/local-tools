"use client";

import { useMemo, useState } from "react";

import { computeContrastUseCase } from "@/modules/contrast-checker/application/compute-contrast-use-case";
import en from "@/modules/contrast-checker/presentation/i18n/en.json";
import es from "@/modules/contrast-checker/presentation/i18n/es.json";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolSection,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function ContrastCheckerTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [foreground, setForeground] = useState("#111111");
  const [background, setBackground] = useState("#ffffff");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(
    () => computeContrastUseCase(foreground, background),
    [foreground, background],
  );

  const reset = () => {
    setForeground("#111111");
    setBackground("#ffffff");
    setSubmitted(false);
  };

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-4 md:grid-cols-2">
        <ToolField label={text.foreground}>
          <ToolInput
            value={foreground}
            onChange={(event) => setForeground(event.target.value)}
          />
        </ToolField>
        <ToolField label={text.background}>
          <ToolInput
            value={background}
            onChange={(event) => setBackground(event.target.value)}
          />
        </ToolField>
      </div>

      <ToolActions
        actions={[
          {
            label: sharedText.buttons.generate,
            onClick: () => setSubmitted(true),
          },
          {
            label: sharedText.buttons.clear,
            onClick: reset,
            disabled:
              foreground === "#111111" &&
              background === "#ffffff" &&
              !submitted,
          },
        ]}
      />

      <div
        className="rounded-md border p-4 text-base"
        style={{ color: foreground, backgroundColor: background }}
      >
        {text.sample}
      </div>

      {submitted ? (
        result.ok ? (
          <div className="space-y-2 text-sm">
            <p>
              {text.ratio}: {result.value.ratio.toFixed(2)}:1
            </p>
            <p>
              {text.aaNormal}: {result.value.aaNormal ? text.pass : text.fail}
            </p>
            <p>
              {text.aaLarge}: {result.value.aaLarge ? text.pass : text.fail}
            </p>
            <p>
              {text.aaaNormal}: {result.value.aaaNormal ? text.pass : text.fail}
            </p>
            <p>
              {text.aaaLarge}: {result.value.aaaLarge ? text.pass : text.fail}
            </p>
          </div>
        ) : (
          <p className="text-sm text-destructive">{text.invalid}</p>
        )
      ) : null}
    </ToolSection>
  );
}
