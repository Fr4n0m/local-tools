"use client";

import { useMemo, useState } from "react";

import { generateUuidsUseCase } from "@/modules/uuid-generator/application/generate-uuids-use-case";
import en from "@/modules/uuid-generator/presentation/i18n/en.json";
import es from "@/modules/uuid-generator/presentation/i18n/es.json";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function UuidGeneratorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [amount, setAmount] = useState(5);
  const [result, setResult] = useState<string[]>([]);

  const onGenerate = () => {
    const safeAmount = Math.min(100, Math.max(1, amount));
    setResult(generateUuidsUseCase(safeAmount));
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
      <button className="neu-button" onClick={onGenerate} type="button">
        {text.generate}
      </button>
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
