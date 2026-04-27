"use client";

import { useMemo, useState } from "react";

import { base64UseCase } from "@/modules/base64-tool/application/base64-use-case";
import en from "@/modules/base64-tool/presentation/i18n/en.json";
import es from "@/modules/base64-tool/presentation/i18n/es.json";
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
    <ToolSection title={text.title}>
      <ToolField label={text.input}>
        <ToolTextarea
          className="h-44"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </ToolField>
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
      <ToolOutputBlock className="pt-1" label={text.output} value={output} />
    </ToolSection>
  );
}
