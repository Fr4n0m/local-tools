"use client";

import { useMemo, useState } from "react";

import { textTransformerUseCase } from "@/modules/text-transformer/application/text-transformer-use-case";
import en from "@/modules/text-transformer/presentation/i18n/en.json";
import es from "@/modules/text-transformer/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function TextTransformerTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.input}</span>
        <textarea
          className="h-40 w-full rounded-md border bg-background/50 p-3"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </label>
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
      <label className="block space-y-2">
        <span className="text-sm">{text.output}</span>
        <textarea
          className="h-40 w-full rounded-md border bg-background/50 p-3"
          readOnly
          value={output}
        />
      </label>
    </div>
  );
}
