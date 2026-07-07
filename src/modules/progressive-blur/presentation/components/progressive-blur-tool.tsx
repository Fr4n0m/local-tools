"use client";

import { useMemo, useState } from "react";

import { buildProgressiveBlurCss } from "@/modules/progressive-blur/domain/progressive-blur";
import en from "@/modules/progressive-blur/presentation/i18n/en.json";
import es from "@/modules/progressive-blur/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { sanitizeIntInput } from "@/shared/lib/safe-input";
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

export function ProgressiveBlurTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [maxBlur, setMaxBlur] = useState(24);
  const [stops, setStops] = useState(4);
  const [output, setOutput] = useState("");

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-3 md:grid-cols-2">
        <ToolField label={text.maxBlur}>
          <ToolInput
            max={80}
            min={2}
            onChange={(event) =>
              setMaxBlur(sanitizeIntInput(event.target.value, 24, 2, 80))
            }
            type="number"
            value={maxBlur}
          />
        </ToolField>
        <ToolField label={text.stops}>
          <ToolInput
            max={8}
            min={2}
            onChange={(event) =>
              setStops(sanitizeIntInput(event.target.value, 4, 2, 8))
            }
            type="number"
            value={stops}
          />
        </ToolField>
      </div>
      <ToolActions
        actions={[
          {
            label: text.generate,
            onClick: () => setOutput(buildProgressiveBlurCss(maxBlur, stops)),
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
