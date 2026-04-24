"use client";

import { useMemo, useState } from "react";

import { generateUuidsUseCase } from "@/modules/uuid-generator/application/generate-uuids-use-case";
import en from "@/modules/uuid-generator/presentation/i18n/en.json";
import es from "@/modules/uuid-generator/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function UuidGeneratorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [amount, setAmount] = useState(5);
  const [result, setResult] = useState<string[]>([]);

  const onGenerate = () => {
    setResult(generateUuidsUseCase(amount));
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
              void copyTextToClipboard(result.join("\n"));
            },
            disabled: result.length === 0,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setAmount(5);
              setResult([]);
            },
            disabled: amount === 5 && result.length === 0,
          },
        ]}
      />
      <div className="space-y-2">
        <p className="text-sm">{text.result}</p>
        <textarea
          className="h-56 w-full rounded-md border bg-background/50 p-3"
          readOnly
          value={result.join("\n")}
        />
      </div>
    </div>
  );
}
