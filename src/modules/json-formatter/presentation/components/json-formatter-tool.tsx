"use client";

import { useMemo, useState } from "react";

import { formatJsonUseCase } from "@/modules/json-formatter/application/format-json-use-case";
import en from "@/modules/json-formatter/presentation/i18n/en.json";
import es from "@/modules/json-formatter/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function JsonFormatterTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const onFormat = () => {
    const result = formatJsonUseCase(input);
    if (result.ok) {
      setOutput(result.value);
      setIsValid(true);
      return;
    }
    setOutput("");
    setIsValid(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.input}</span>
        <textarea
          className="h-52 w-full rounded-md border bg-background/50 p-3"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </label>
      <ToolActions
        actions={[
          {
            label: text.format,
            onClick: onFormat,
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
              setIsValid(null);
            },
            disabled: input.length === 0 && output.length === 0,
          },
        ]}
      />
      {isValid !== null ? (
        <p className="text-sm">{isValid ? text.valid : text.invalid}</p>
      ) : null}
      <label className="block space-y-2">
        <span className="text-sm">{text.output}</span>
        <textarea
          className="h-52 w-full rounded-md border bg-background/50 p-3"
          readOnly
          value={output}
        />
      </label>
    </div>
  );
}
