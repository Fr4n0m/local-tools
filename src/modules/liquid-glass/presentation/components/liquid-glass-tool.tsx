"use client";

import { useMemo, useState } from "react";

import { buildLiquidGlassCss } from "@/modules/liquid-glass/domain/liquid-glass";
import en from "@/modules/liquid-glass/presentation/i18n/en.json";
import es from "@/modules/liquid-glass/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function LiquidGlassTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [opacity, setOpacity] = useState(0.28);
  const [blur, setBlur] = useState(18);
  const [output, setOutput] = useState("");

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-3 md:grid-cols-2">
        <ToolField label={text.opacity}>
          <ToolInput
            max={0.8}
            min={0.05}
            onChange={(event) => setOpacity(Number(event.target.value))}
            step={0.01}
            type="number"
            value={opacity}
          />
        </ToolField>
        <ToolField label={text.blur}>
          <ToolInput
            max={40}
            min={4}
            onChange={(event) => setBlur(Number(event.target.value))}
            type="number"
            value={blur}
          />
        </ToolField>
      </div>
      <ToolActions
        actions={[
          {
            label: text.generate,
            onClick: () => setOutput(buildLiquidGlassCss(opacity, blur)),
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
