"use client";

import { useMemo, useState } from "react";

import { formatJsonUseCase } from "@/modules/json-formatter/application/format-json-use-case";
import {
  repairJson,
  resolveJsonPath,
} from "@/modules/json-formatter/domain/format-json";
import en from "@/modules/json-formatter/presentation/i18n/en.json";
import es from "@/modules/json-formatter/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
  ToolTextarea,
  ToolSwitch,
  ToolToggleField,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

function buildTreeLines(value: unknown, prefix = "$"): string[] {
  if (Array.isArray(value)) {
    return [
      `${prefix} []`,
      ...value.flatMap((item, index) =>
        buildTreeLines(item, `${prefix}[${index}]`),
      ),
    ];
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return [
      `${prefix} {}`,
      ...entries.flatMap(([key, entryValue]) =>
        buildTreeLines(entryValue, `${prefix}.${key}`),
      ),
    ];
  }

  return [`${prefix}: ${String(value)}`];
}

function diffJsonValues(
  left: unknown,
  right: unknown,
  path = "$",
  acc: string[] = [],
): string[] {
  if (JSON.stringify(left) === JSON.stringify(right)) {
    return acc;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const size = Math.max(left.length, right.length);
    for (let index = 0; index < size; index += 1) {
      diffJsonValues(left[index], right[index], `${path}[${index}]`, acc);
    }
    return acc;
  }

  if (
    left &&
    typeof left === "object" &&
    right &&
    typeof right === "object" &&
    !Array.isArray(left) &&
    !Array.isArray(right)
  ) {
    const keys = new Set([
      ...Object.keys(left as Record<string, unknown>),
      ...Object.keys(right as Record<string, unknown>),
    ]);
    Array.from(keys).forEach((key) => {
      diffJsonValues(
        (left as Record<string, unknown>)[key],
        (right as Record<string, unknown>)[key],
        `${path}.${key}`,
        acc,
      );
    });
    return acc;
  }

  acc.push(path);
  return acc;
}

export function JsonFormatterTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [input, setInput] = useState("");
  const [compareInput, setCompareInput] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [output, setOutput] = useState("");
  const [treeOutput, setTreeOutput] = useState("");
  const [compareOutput, setCompareOutput] = useState("");
  const [pathOutput, setPathOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorText, setErrorText] = useState("");
  const [minify, setMinify] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const statusId = "json-formatter-status";

  const applySuccess = (value: string) => {
    setOutput(value);
    setIsValid(true);
    setErrorText("");
    setPathOutput("");

    try {
      const parsed = JSON.parse(value);
      setTreeOutput(buildTreeLines(parsed).join("\n"));

      if (compareMode && compareInput.trim().length > 0) {
        const compareResult = formatJsonUseCase(compareInput, {
          minify,
          sortKeys,
        });
        if (compareResult.ok) {
          const changedPaths = diffJsonValues(
            parsed,
            JSON.parse(compareResult.value),
          );
          setCompareOutput(
            changedPaths.length === 0
              ? text.compareSame
              : `${text.compareDifferent.replace("{count}", String(changedPaths.length))}\n${changedPaths.join("\n")}`,
          );
        } else {
          setCompareOutput(text.invalid);
        }
      } else {
        setCompareOutput("");
      }
    } catch {
      setTreeOutput("");
      setCompareOutput("");
    }
  };

  const onFormat = () => {
    const result = formatJsonUseCase(input, { minify, sortKeys });
    if (result.ok) {
      applySuccess(result.value);
      return;
    }
    setOutput("");
    setTreeOutput("");
    setCompareOutput("");
    setIsValid(false);
    if (result.error.line !== null && result.error.column !== null) {
      setErrorText(
        text.invalidAt
          .replace("{line}", String(result.error.line))
          .replace("{column}", String(result.error.column)),
      );
      return;
    }
    setErrorText(text.invalidUnknown);
  };

  const onRepair = () => {
    const result = repairJson(input, { minify, sortKeys });
    if (result.ok) {
      applySuccess(result.value);
      return;
    }
    setOutput("");
    setTreeOutput("");
    setCompareOutput("");
    setIsValid(false);
    setErrorText(text.invalidUnknown);
  };

  const onInspectPath = () => {
    const result = resolveJsonPath(output || input, pathInput);
    if (result.ok) {
      setPathOutput(result.value);
      return;
    }
    setPathOutput(
      result.reason === "invalid-path" ? text.pathInvalid : text.pathMissing,
    );
  };

  const onFetch = async () => {
    try {
      const response = await fetch(urlInput);
      const payload = await response.text();
      setInput(payload);
      setErrorText("");
      setIsValid(null);
    } catch {
      setErrorText(text.fetchError);
      setIsValid(false);
    }
  };

  return (
    <ToolSection title={text.title}>
      <ToolField label={text.input}>
        <ToolTextarea
          aria-describedby={statusId}
          aria-invalid={isValid === false}
          className="h-52"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </ToolField>
      <ToolField label={text.urlInput}>
        <ToolInput
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
        />
      </ToolField>
      {compareMode ? (
        <ToolField label={text.compareInput}>
          <ToolTextarea
            className="h-40"
            value={compareInput}
            onChange={(event) => setCompareInput(event.target.value)}
          />
        </ToolField>
      ) : null}
      <ToolField label={text.pathInput}>
        <ToolInput
          placeholder="$.items[0].name"
          value={pathInput}
          onChange={(event) => setPathInput(event.target.value)}
        />
      </ToolField>
      <ToolActions
        actions={[
          {
            label: text.format,
            onClick: onFormat,
            disabled: input.trim().length === 0,
          },
          {
            label: text.repair,
            onClick: onRepair,
            disabled: input.trim().length === 0,
          },
          {
            label: text.fetch,
            onClick: () => {
              void onFetch();
            },
            disabled: urlInput.trim().length === 0,
          },
          {
            label: text.inspectPath,
            onClick: onInspectPath,
            disabled:
              pathInput.trim().length === 0 ||
              (input.trim().length === 0 && output.trim().length === 0),
          },
          {
            label: sharedText.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(output);
            },
            disabled: output.trim().length === 0,
          },
          {
            label: sharedText.buttons.download,
            onClick: () => {
              downloadTextFile(output, "formatted.json");
            },
            disabled: output.trim().length === 0,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setInput("");
              setCompareInput("");
              setPathInput("");
              setUrlInput("");
              setOutput("");
              setTreeOutput("");
              setCompareOutput("");
              setPathOutput("");
              setIsValid(null);
              setErrorText("");
              setMinify(false);
              setSortKeys(false);
              setCompareMode(false);
            },
            disabled:
              input.length === 0 &&
              compareInput.length === 0 &&
              pathInput.length === 0 &&
              urlInput.length === 0 &&
              output.length === 0 &&
              !compareMode,
          },
        ]}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <ToolToggleField label={text.minify}>
          <ToolSwitch checked={minify} onChange={setMinify} />
        </ToolToggleField>
        <ToolToggleField label={text.sortKeys}>
          <ToolSwitch checked={sortKeys} onChange={setSortKeys} />
        </ToolToggleField>
        <ToolToggleField label={text.compareMode}>
          <ToolSwitch checked={compareMode} onChange={setCompareMode} />
        </ToolToggleField>
      </div>
      {isValid !== null ? (
        <p className="text-sm" id={statusId} role="status" aria-live="polite">
          {isValid
            ? text.valid
            : `${text.invalid}${errorText ? `. ${errorText}` : ""}`}
        </p>
      ) : null}
      <ToolOutputBlock className="pt-1" label={text.output} value={output} />
      <ToolOutputBlock
        className="pt-1"
        label={text.treeOutput}
        value={treeOutput}
      />
      {compareMode ? (
        <ToolOutputBlock
          className="pt-1"
          label={text.compareOutput}
          value={compareOutput}
        />
      ) : null}
      {pathOutput ? (
        <ToolOutputBlock
          className="pt-1"
          label={text.pathOutput}
          value={pathOutput}
        />
      ) : null}
    </ToolSection>
  );
}
