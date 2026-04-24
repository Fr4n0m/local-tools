"use client";

import { useMemo, useState } from "react";

import { base64UseCase } from "@/modules/base64-tool/application/base64-use-case";
import en from "@/modules/base64-tool/presentation/i18n/en.json";
import es from "@/modules/base64-tool/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function Base64Tool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const onEncode = () => {
    setOutput(base64UseCase.encode(input));
  };

  const onDecode = () => {
    const result = base64UseCase.decode(input);
    setOutput(result.ok ? result.value : text.error);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.input}</span>
        <textarea
          className="h-44 w-full rounded-md border bg-background/50 p-3"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </label>
      <ToolActions
        actions={[
          {
            label: text.encode,
            onClick: onEncode,
            disabled: input.trim().length === 0,
          },
          {
            label: text.decode,
            onClick: onDecode,
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
          className="h-44 w-full rounded-md border bg-background/50 p-3"
          readOnly
          value={output}
        />
      </label>
    </div>
  );
}
