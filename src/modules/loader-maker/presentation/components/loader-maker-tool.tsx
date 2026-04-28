"use client";

import { useMemo, useState } from "react";

import {
  buildLoaderCss,
  type LoaderType,
} from "@/modules/loader-maker/domain/loader-maker";
import en from "@/modules/loader-maker/presentation/i18n/en.json";
import es from "@/modules/loader-maker/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
  ToolSelect,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function LoaderMakerTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [type, setType] = useState<LoaderType>("spinner");
  const [color, setColor] = useState("#fca311");
  const [size, setSize] = useState(48);
  const [output, setOutput] = useState("");

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-3 md:grid-cols-3">
        <ToolField label={text.type}>
          <ToolSelect
            onChange={(value) => {
              if (
                value === "spinner" ||
                value === "dots" ||
                value === "pulse"
              ) {
                setType(value);
              }
            }}
            options={[
              { value: "spinner", label: text.spinner },
              { value: "dots", label: text.dots },
              { value: "pulse", label: text.pulse },
            ]}
            value={type}
          />
        </ToolField>
        <ToolField label={text.color}>
          <ToolInput
            onChange={(event) => setColor(event.target.value)}
            type="color"
            value={color}
          />
        </ToolField>
        <ToolField label={text.size}>
          <ToolInput
            max={120}
            min={16}
            onChange={(event) => setSize(Number(event.target.value))}
            type="number"
            value={size}
          />
        </ToolField>
      </div>
      <ToolActions
        actions={[
          {
            label: text.generate,
            onClick: () => setOutput(buildLoaderCss(type, color, size)),
          },
          {
            label: sharedText.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(output);
            },
            disabled: !output,
          },
        ]}
      />
      <ToolOutputBlock label={text.output} value={output} />
    </ToolSection>
  );
}
