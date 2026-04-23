"use client";

import { useMemo, useState } from "react";

import { base64UseCase } from "@/modules/base64-tool/application/base64-use-case";
import en from "@/modules/base64-tool/presentation/i18n/en.json";
import es from "@/modules/base64-tool/presentation/i18n/es.json";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function Base64Tool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const onEncode = () => {
    setOutput(base64UseCase.encode(input));
  };

  const onDecode = () => {
    const result = base64UseCase.decode(input);
    setOutput(result.ok ? result.value : text.error);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.input}</span>
        <textarea
          className="h-44 w-full rounded-md border bg-background/50 p-3"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="neu-button" onClick={onEncode} type="button">
          {text.encode}
        </button>
        <button className="neu-button" onClick={onDecode} type="button">
          {text.decode}
        </button>
      </div>
      <label className="block space-y-2">
        <span className="text-sm">{text.output}</span>
        <textarea
          className="h-44 w-full rounded-md border bg-background/50 p-3"
          readOnly
          value={output}
        />
      </label>
    </div>
  );
}
