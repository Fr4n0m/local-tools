"use client";

import { useMemo, useState } from "react";

import { batchRenamePreviewUseCase } from "@/modules/batch-rename/application/batch-rename-preview-use-case";
import en from "@/modules/batch-rename/presentation/i18n/en.json";
import es from "@/modules/batch-rename/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolSection,
  ToolTextarea,
  ToolToggleField,
} from "@/shared/presentation/components/tool-form";
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
    <ToolSection title={text.title}>
      <ToolField label={text.input}>
        <ToolTextarea
          className="h-36"
          value={names}
          onChange={(event) => setNames(event.target.value)}
        />
      </ToolField>
      <div className="grid gap-4 md:grid-cols-2">
        <ToolField label={text.search}>
          <ToolInput
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </ToolField>
        <ToolField label={text.replace}>
          <ToolInput
            value={replaceValue}
            onChange={(event) => setReplaceValue(event.target.value)}
          />
        </ToolField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ToolField label={text.prefix}>
          <ToolInput
            value={prefix}
            onChange={(event) => setPrefix(event.target.value)}
          />
        </ToolField>
        <ToolField label={text.suffix}>
          <ToolInput
            value={suffix}
            onChange={(event) => setSuffix(event.target.value)}
          />
        </ToolField>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <ToolToggleField className="md:col-span-1" label={text.sequence}>
          <input
            checked={addSequence}
            onChange={(event) => setAddSequence(event.target.checked)}
            type="checkbox"
          />
        </ToolToggleField>
        <ToolField label={text.startNumber}>
          <ToolInput
            min={0}
            type="number"
            value={startNumber}
            onChange={(event) =>
              setStartNumber(Number(event.target.value || 0))
            }
          />
        </ToolField>
        <ToolField label={text.padWidth}>
          <ToolInput
            min={1}
            type="number"
            value={padWidth}
            onChange={(event) => setPadWidth(Number(event.target.value || 1))}
          />
        </ToolField>
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
      <ToolField label={text.result}>
        <div className="max-h-72 overflow-auto rounded-md border bg-background/40 p-3">
          {preview.length > 0 ? (
            <div aria-label={text.result} role="table">
              <div
                className="mb-1.5 grid grid-cols-2 gap-4 border-b border-border/50 pb-1.5"
                role="row"
              >
                <span
                  className="text-xs font-semibold uppercase tracking-wide text-foreground/50"
                  role="columnheader"
                >
                  {text.before}
                </span>
                <span
                  className="text-xs font-semibold uppercase tracking-wide text-foreground/50"
                  role="columnheader"
                >
                  {text.after}
                </span>
              </div>
              {preview.map((item) => {
                const changed = item.original !== item.renamed;
                return (
                  <div
                    className="grid grid-cols-2 gap-4 py-1"
                    key={`${item.original}-${item.renamed}`}
                    role="row"
                  >
                    <span
                      className={`truncate text-sm ${changed ? "text-foreground/50" : "text-foreground/70"}`}
                      role="cell"
                      title={item.original}
                    >
                      {item.original}
                    </span>
                    <span
                      className={`truncate text-sm font-medium ${changed ? "text-primary" : "text-foreground/50"}`}
                      role="cell"
                      title={item.renamed}
                    >
                      {item.renamed}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </ToolField>
    </ToolSection>
  );
}
