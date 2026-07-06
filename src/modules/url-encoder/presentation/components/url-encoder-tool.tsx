"use client";

import { useMemo, useState } from "react";

import { urlEncoderUseCase } from "@/modules/url-encoder/application/url-encoder-use-case";
import en from "@/modules/url-encoder/presentation/i18n/en.json";
import es from "@/modules/url-encoder/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolOutputBlock,
  ToolSection,
  ToolSelect,
  ToolSwitch,
  ToolTextarea,
  ToolToggleField,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function UrlEncoderTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("component");
  const [multiline, setMultiline] = useState(false);
  const [usePlusForSpaces, setUsePlusForSpaces] = useState(false);

  const onEncode = () => {
    setOutput(
      urlEncoderUseCase.encode(input, {
        mode: mode === "full-url" ? "full-url" : "component",
        multiline,
        usePlusForSpaces,
      }),
    );
  };

  const onDecode = () => {
    const result = urlEncoderUseCase.decode(input, {
      multiline,
      usePlusForSpaces,
    });
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
      <ToolField label={text.mode}>
        <ToolSelect
          options={[
            { value: "component", label: text.modeComponent },
            { value: "full-url", label: text.modeFullUrl },
          ]}
          value={mode}
          onChange={setMode}
        />
      </ToolField>
      <div className="grid gap-3 md:grid-cols-2">
        <ToolToggleField label={text.multiline}>
          <ToolSwitch checked={multiline} onChange={setMultiline} />
        </ToolToggleField>
        <ToolToggleField label={text.plusSpaces}>
          <ToolSwitch
            checked={usePlusForSpaces}
            onChange={setUsePlusForSpaces}
          />
        </ToolToggleField>
      </div>
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
            label: text.download,
            onClick: () => {
              downloadTextFile(output, "url-encoded.txt");
            },
            disabled: output.trim().length === 0,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setInput("");
              setOutput("");
              setMode("component");
              setMultiline(false);
              setUsePlusForSpaces(false);
            },
            disabled:
              input.length === 0 &&
              output.length === 0 &&
              mode === "component" &&
              !multiline &&
              !usePlusForSpaces,
          },
        ]}
      />
      <ToolOutputBlock className="pt-1" label={text.output} value={output} />
    </ToolSection>
  );
}
