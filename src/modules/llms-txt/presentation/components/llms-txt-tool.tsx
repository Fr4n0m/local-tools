"use client";

import { useMemo, useState } from "react";

import { buildLlmsTxt } from "@/modules/llms-txt/domain/llms-txt";
import en from "@/modules/llms-txt/presentation/i18n/en.json";
import es from "@/modules/llms-txt/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function LlmsTxtTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];

  const [projectName, setProjectName] = useState("LocalTools");
  const [projectUrl, setProjectUrl] = useState(
    "https://github.com/Fr4n0m/local-tools",
  );
  const [summary, setSummary] = useState(
    "Private browser-based developer toolbox with client-side tools.",
  );
  const [docsUrl, setDocsUrl] = useState(
    "https://github.com/Fr4n0m/local-tools/tree/master/docs",
  );
  const [sourceUrl, setSourceUrl] = useState(
    "https://github.com/Fr4n0m/local-tools",
  );
  const [license, setLicense] = useState("MIT");
  const [rules, setRules] = useState(text.sampleRule);
  const [output, setOutput] = useState("");

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-3 md:grid-cols-2">
        <ToolField label={text.projectName}>
          <ToolInput
            onChange={(e) => setProjectName(e.target.value)}
            value={projectName}
          />
        </ToolField>
        <ToolField label={text.projectUrl}>
          <ToolInput
            onChange={(e) => setProjectUrl(e.target.value)}
            value={projectUrl}
          />
        </ToolField>
        <ToolField label={text.summary}>
          <ToolInput
            onChange={(e) => setSummary(e.target.value)}
            value={summary}
          />
        </ToolField>
        <ToolField label={text.docsUrl}>
          <ToolInput
            onChange={(e) => setDocsUrl(e.target.value)}
            value={docsUrl}
          />
        </ToolField>
        <ToolField label={text.sourceUrl}>
          <ToolInput
            onChange={(e) => setSourceUrl(e.target.value)}
            value={sourceUrl}
          />
        </ToolField>
        <ToolField label={text.license}>
          <ToolInput
            onChange={(e) => setLicense(e.target.value)}
            value={license}
          />
        </ToolField>
      </div>

      <ToolField label={text.rules}>
        <ToolTextarea
          className="h-28"
          onChange={(e) => setRules(e.target.value)}
          value={rules}
        />
      </ToolField>

      <ToolActions
        actions={[
          {
            label: text.generate,
            onClick: () => {
              setOutput(
                buildLlmsTxt({
                  projectName,
                  projectUrl,
                  summary,
                  docsUrl,
                  sourceUrl,
                  license,
                  rules,
                }),
              );
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
              downloadTextFile(output, "llms.txt");
            },
            disabled: !output,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setOutput("");
            },
            disabled: !output,
          },
        ]}
      />

      <ToolOutputBlock label={text.output} value={output} />
    </ToolSection>
  );
}
