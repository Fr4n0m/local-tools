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
  const [errorText, setErrorText] = useState("");
  const [minify, setMinify] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);
  const statusId = "json-formatter-status";

  const onFormat = () => {
    const result = formatJsonUseCase(input, { minify, sortKeys });
    if (result.ok) {
      setOutput(result.value);
      setIsValid(true);
      setErrorText("");
      return;
    }
    setOutput("");
    setIsValid(false);
    if (result.error.line !== null && result.error.column !== null) {
      setErrorText(
        text.invalidAt
          .replace("{line}", String(result.error.line))
          .replace("{column}", String(result.error.column)),
      );
      return;
    }
    setErrorText(text.invalidUnknown);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.input}</span>
        <textarea
          aria-describedby={statusId}
          aria-invalid={isValid === false}
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
              setErrorText("");
              setMinify(false);
              setSortKeys(false);
            },
            disabled: input.length === 0 && output.length === 0,
          },
        ]}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2 rounded-md border bg-background/40 p-3 text-sm">
          <input
            checked={minify}
            onChange={(event) => setMinify(event.target.checked)}
            type="checkbox"
          />
          <span>{text.minify}</span>
        </label>
        <label className="flex items-center gap-2 rounded-md border bg-background/40 p-3 text-sm">
          <input
            checked={sortKeys}
            onChange={(event) => setSortKeys(event.target.checked)}
            type="checkbox"
          />
          <span>{text.sortKeys}</span>
        </label>
      </div>
      {isValid !== null ? (
        <p className="text-sm" id={statusId} role="status" aria-live="polite">
          {isValid
            ? text.valid
            : `${text.invalid}${errorText ? `. ${errorText}` : ""}`}
        </p>
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
