"use client";

import { useMemo, useState } from "react";

import { textTransformerUseCase } from "@/modules/text-transformer/application/text-transformer-use-case";
import en from "@/modules/text-transformer/presentation/i18n/en.json";
import es from "@/modules/text-transformer/presentation/i18n/es.json";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function TextTransformerTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.input}</span>
        <textarea
          className="h-40 w-full rounded-md border bg-background/50 p-3"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          className="neu-button"
          onClick={() => setOutput(textTransformerUseCase.uppercase(input))}
          type="button"
        >
          {text.upper}
        </button>
        <button
          className="neu-button"
          onClick={() => setOutput(textTransformerUseCase.lowercase(input))}
          type="button"
        >
          {text.lower}
        </button>
        <button
          className="neu-button"
          onClick={() => setOutput(textTransformerUseCase.capitalize(input))}
          type="button"
        >
          {text.capitalize}
        </button>
        <button
          className="neu-button"
          onClick={() => setOutput(textTransformerUseCase.trim(input))}
          type="button"
        >
          {text.trim}
        </button>
      </div>
      <label className="block space-y-2">
        <span className="text-sm">{text.output}</span>
        <textarea
          className="h-40 w-full rounded-md border bg-background/50 p-3"
          readOnly
          value={output}
        />
      </label>
    </div>
  );
}
