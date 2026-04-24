"use client";

import { useMemo, useState } from "react";

import { batchRenamePreviewUseCase } from "@/modules/batch-rename/application/batch-rename-preview-use-case";
import en from "@/modules/batch-rename/presentation/i18n/en.json";
import es from "@/modules/batch-rename/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function BatchRenameTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [names, setNames] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [addSequence, setAddSequence] = useState(false);
  const [startNumber, setStartNumber] = useState(1);
  const [padWidth, setPadWidth] = useState(3);

  const preview = batchRenamePreviewUseCase(names, searchValue, replaceValue, {
    prefix,
    suffix,
    addSequence,
    startNumber,
    padWidth,
  });
  const previewText = preview
    .map((item) => `${item.original} => ${item.renamed}`)
    .join("\n");

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
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm">{text.prefix}</span>
          <input
            className="w-full rounded-md border bg-background/50 p-3"
            value={prefix}
            onChange={(event) => setPrefix(event.target.value)}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm">{text.suffix}</span>
          <input
            className="w-full rounded-md border bg-background/50 p-3"
            value={suffix}
            onChange={(event) => setSuffix(event.target.value)}
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex items-center gap-2 rounded-md border bg-background/40 p-3 text-sm md:col-span-1">
          <input
            checked={addSequence}
            onChange={(event) => setAddSequence(event.target.checked)}
            type="checkbox"
          />
          <span>{text.sequence}</span>
        </label>
        <label className="block space-y-2">
          <span className="text-sm">{text.startNumber}</span>
          <input
            className="w-full rounded-md border bg-background/50 p-3"
            min={0}
            type="number"
            value={startNumber}
            onChange={(event) =>
              setStartNumber(Number(event.target.value || 0))
            }
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm">{text.padWidth}</span>
          <input
            className="w-full rounded-md border bg-background/50 p-3"
            min={1}
            type="number"
            value={padWidth}
            onChange={(event) => setPadWidth(Number(event.target.value || 1))}
          />
        </label>
      </div>
      <ToolActions
        actions={[
          {
            label: sharedText.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(previewText);
            },
            disabled: preview.length === 0,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setNames("");
              setSearchValue("");
              setReplaceValue("");
              setPrefix("");
              setSuffix("");
              setAddSequence(false);
              setStartNumber(1);
              setPadWidth(3);
            },
            disabled:
              names.length === 0 &&
              searchValue.length === 0 &&
              replaceValue.length === 0 &&
              prefix.length === 0 &&
              suffix.length === 0 &&
              !addSequence &&
              startNumber === 1 &&
              padWidth === 3,
          },
        ]}
      />
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
