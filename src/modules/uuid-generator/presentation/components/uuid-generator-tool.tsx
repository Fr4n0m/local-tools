"use client";

import { useMemo, useState } from "react";

import { generateUuidsUseCase } from "@/modules/uuid-generator/application/generate-uuids-use-case";
import en from "@/modules/uuid-generator/presentation/i18n/en.json";
import es from "@/modules/uuid-generator/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolOutputBlock,
  ToolSection,
  ToolToggleField,
  ToolInput,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function UuidGeneratorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [amount, setAmount] = useState(5);
  const [stripHyphens, setStripHyphens] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const output = result.join("\n");

  const onGenerate = () => {
    setResult(generateUuidsUseCase(amount, { stripHyphens }));
  };

  return (
    <ToolSection title={text.title}>
      <ToolField label={text.amount}>
        <ToolInput
          type="number"
          min={1}
          max={100}
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value || 1))}
        />
      </ToolField>
      <ToolToggleField label={text.stripHyphens}>
        <input
          checked={stripHyphens}
          onChange={(event) => setStripHyphens(event.target.checked)}
          type="checkbox"
        />
      </ToolToggleField>
      <ToolActions
        actions={[
          {
            label: text.generate,
            onClick: onGenerate,
            disabled: Number.isNaN(amount),
          },
          {
            label: sharedText.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(output);
            },
            disabled: result.length === 0,
          },
          {
            label: text.download,
            onClick: () => {
              downloadTextFile(output, "uuids.txt");
            },
            disabled: result.length === 0,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setAmount(5);
              setStripHyphens(false);
              setResult([]);
            },
            disabled: amount === 5 && !stripHyphens && result.length === 0,
          },
        ]}
      />
      <ToolOutputBlock className="pt-1" label={text.result} value={output} />
    </ToolSection>
  );
}
