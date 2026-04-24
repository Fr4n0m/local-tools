"use client";

import { useMemo, useState } from "react";

import { generateUuidsUseCase } from "@/modules/uuid-generator/application/generate-uuids-use-case";
import en from "@/modules/uuid-generator/presentation/i18n/en.json";
import es from "@/modules/uuid-generator/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.amount}</span>
        <input
          className="w-full rounded-md border bg-background/50 p-3"
          type="number"
          min={1}
          max={100}
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value || 1))}
        />
      </label>
      <label className="flex items-center gap-2 rounded-md border bg-background/40 p-3 text-sm">
        <input
          checked={stripHyphens}
          onChange={(event) => setStripHyphens(event.target.checked)}
          type="checkbox"
        />
        <span>{text.stripHyphens}</span>
      </label>
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
      <div className="space-y-2">
        <p className="text-sm">{text.result}</p>
        <textarea
          className="h-56 w-full rounded-md border bg-background/50 p-3"
          readOnly
          value={output}
        />
      </div>
    </div>
  );
}
