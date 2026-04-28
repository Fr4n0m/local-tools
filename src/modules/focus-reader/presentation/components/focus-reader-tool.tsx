"use client";

import { useMemo, useState } from "react";

import {
  estimateReadMinutes,
  splitParagraphs,
} from "@/modules/focus-reader/domain/focus-reader";
import en from "@/modules/focus-reader/presentation/i18n/en.json";
import es from "@/modules/focus-reader/presentation/i18n/es.json";
import {
  ToolField,
  ToolSection,
  ToolTextarea,
  ToolToggleField,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function FocusReaderTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [input, setInput] = useState("");
  const [focusMode, setFocusMode] = useState(true);

  const paragraphs = splitParagraphs(input);
  const readMinutes = estimateReadMinutes(input);

  return (
    <ToolSection title={text.title}>
      <ToolField label={text.input}>
        <ToolTextarea
          className="h-40"
          onChange={(event) => setInput(event.target.value)}
          placeholder={text.placeholder}
          value={input}
        />
      </ToolField>

      <ToolToggleField label={text.focus}>
        <input
          checked={focusMode}
          onChange={(event) => setFocusMode(event.target.checked)}
          type="checkbox"
        />
      </ToolToggleField>

      <p className="text-sm text-muted-foreground">
        {text.readTime}: {readMinutes} {text.minutes}
      </p>

      <div className="space-y-3">
        {paragraphs.map((paragraph, index) => (
          <p
            className={
              focusMode
                ? "mx-auto max-w-3xl text-[1.05rem] leading-8"
                : "text-sm leading-7"
            }
            key={`${index}-${paragraph.slice(0, 24)}`}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </ToolSection>
  );
}
