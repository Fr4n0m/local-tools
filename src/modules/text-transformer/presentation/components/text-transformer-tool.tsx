"use client";

import { useMemo, useState } from "react";

import { textTransformerUseCase } from "@/modules/text-transformer/application/text-transformer-use-case";
import en from "@/modules/text-transformer/presentation/i18n/en.json";
import es from "@/modules/text-transformer/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolOutputBlock,
  ToolSection,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function TextTransformerTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <ToolSection title={text.title}>
      <ToolField label={text.input}>
        <ToolTextarea
          className="h-40"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </ToolField>
      <ToolActions
        actions={[
          {
            label: text.upper,
            onClick: () => setOutput(textTransformerUseCase.uppercase(input)),
            disabled: input.trim().length === 0,
          },
          {
            label: text.lower,
            onClick: () => setOutput(textTransformerUseCase.lowercase(input)),
            disabled: input.trim().length === 0,
          },
          {
            label: text.capitalize,
            onClick: () => setOutput(textTransformerUseCase.capitalize(input)),
            disabled: input.trim().length === 0,
          },
          {
            label: text.trim,
            onClick: () => setOutput(textTransformerUseCase.trim(input)),
            disabled: input.trim().length === 0,
          },
          {
            label: text.removeSpaces,
            onClick: () =>
              setOutput(textTransformerUseCase.removeSpaces(input)),
            disabled: input.trim().length === 0,
          },
          {
            label: text.normalizeSpaces,
            onClick: () =>
              setOutput(textTransformerUseCase.normalizeSpaces(input)),
            disabled: input.trim().length === 0,
          },
          {
            label: text.slugify,
            onClick: () => setOutput(textTransformerUseCase.slugify(input)),
            disabled: input.trim().length === 0,
          },
          {
            label: sharedText.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(output);
            },
            disabled: output.trim().length === 0,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setInput("");
              setOutput("");
            },
            disabled: input.length === 0 && output.length === 0,
          },
        ]}
      />
      <ToolOutputBlock className="pt-1" label={text.output} value={output} />
    </ToolSection>
  );
}
