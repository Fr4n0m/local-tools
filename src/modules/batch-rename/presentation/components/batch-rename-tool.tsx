"use client";

import { useMemo, useState } from "react";

import { batchRenamePreviewUseCase } from "@/modules/batch-rename/application/batch-rename-preview-use-case";
import en from "@/modules/batch-rename/presentation/i18n/en.json";
import es from "@/modules/batch-rename/presentation/i18n/es.json";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function BatchRenameTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [names, setNames] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");

  const preview = batchRenamePreviewUseCase(names, searchValue, replaceValue);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.input}</span>
        <textarea
          className="h-36 w-full rounded-md border bg-background/50 p-3"
          value={names}
          onChange={(event) => setNames(event.target.value)}
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm">{text.search}</span>
          <input
            className="w-full rounded-md border bg-background/50 p-3"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm">{text.replace}</span>
          <input
            className="w-full rounded-md border bg-background/50 p-3"
            value={replaceValue}
            onChange={(event) => setReplaceValue(event.target.value)}
          />
        </label>
      </div>
      <div className="space-y-2">
        <p className="text-sm">{text.result}</p>
        <div className="max-h-72 overflow-auto rounded-md border bg-background/40 p-3">
          {preview.map((item) => (
            <p className="text-sm" key={`${item.original}-${item.renamed}`}>
              {item.original} =&gt; {item.renamed}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
