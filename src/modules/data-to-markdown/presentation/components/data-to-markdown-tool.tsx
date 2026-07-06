"use client";

import { useMemo, useState } from "react";

import {
  parseCsv,
  parseJson,
  parseTsv,
  rowsFromMatrix,
  toMarkdownTable,
  type MarkdownAlignment,
} from "@/modules/data-to-markdown/domain/data-to-markdown";
import en from "@/modules/data-to-markdown/presentation/i18n/en.json";
import es from "@/modules/data-to-markdown/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolOutputBlock,
  ToolSection,
  ToolSelect,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function DataToMarkdownTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];

  const [format, setFormat] = useState<"csv" | "tsv" | "matrix" | "json">(
    "csv",
  );
  const [alignment, setAlignment] = useState<MarkdownAlignment>("left");
  const [input, setInput] = useState(text.placeholderCsv);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const placeholder =
    format === "csv"
      ? text.placeholderCsv
      : format === "tsv"
        ? text.placeholderTsv
        : format === "matrix"
          ? text.placeholderMatrix
          : text.placeholderJson;

  return (
    <ToolSection title={text.title}>
      <ToolField label={text.format}>
        <ToolSelect
          onChange={(value) => {
            if (
              value === "csv" ||
              value === "tsv" ||
              value === "matrix" ||
              value === "json"
            ) {
              setFormat(value);
              setInput(
                value === "csv"
                  ? text.placeholderCsv
                  : value === "tsv"
                    ? text.placeholderTsv
                    : value === "matrix"
                      ? text.placeholderMatrix
                      : text.placeholderJson,
              );
              setOutput("");
              setError("");
            }
          }}
          options={[
            { value: "csv", label: text.csv },
            { value: "tsv", label: text.tsv },
            { value: "matrix", label: text.matrix },
            { value: "json", label: text.json },
          ]}
          value={format}
        />
      </ToolField>
      <ToolField label={text.alignment}>
        <ToolSelect
          onChange={(value) => {
            if (value === "left" || value === "center" || value === "right") {
              setAlignment(value);
            }
          }}
          options={[
            { value: "left", label: text.alignLeft },
            { value: "center", label: text.alignCenter },
            { value: "right", label: text.alignRight },
          ]}
          value={alignment}
        />
      </ToolField>

      <ToolField htmlFor="data-to-markdown-input" label={text.input}>
        <ToolTextarea
          className="h-40"
          id="data-to-markdown-input"
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          value={input}
        />
      </ToolField>

      <ToolActions
        actions={[
          {
            label: text.convert,
            onClick: () => {
              const rows =
                format === "csv"
                  ? parseCsv(input)
                  : format === "tsv"
                    ? parseTsv(input)
                    : format === "matrix"
                      ? rowsFromMatrix(
                          input
                            .split(/\r?\n/)
                            .filter(Boolean)
                            .map((line) =>
                              line.split("|").map((cell) => cell.trim()),
                            ),
                        )
                      : parseJson(input);
              const markdown = toMarkdownTable(rows, alignment);
              if (!markdown) {
                setError(text.invalid);
                setOutput("");
                return;
              }
              setError("");
              setOutput(markdown);
            },
          },
          {
            label: sharedText.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(output);
            },
            disabled: !output,
          },
          {
            label: sharedText.buttons.download,
            onClick: () => {
              downloadTextFile(
                output,
                "table.md",
                "text/markdown;charset=utf-8",
              );
            },
            disabled: !output,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setInput("");
              setOutput("");
              setError("");
            },
            disabled: !input && !output,
          },
        ]}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ToolOutputBlock label={text.output} value={output} />
      {output ? (
        <div className="space-y-2">
          <p className="text-sm">{text.renderPreview}</p>
          <div className="overflow-x-auto rounded-md border bg-background/30 p-3">
            <pre className="whitespace-pre-wrap text-sm">{output}</pre>
          </div>
        </div>
      ) : null}
    </ToolSection>
  );
}
