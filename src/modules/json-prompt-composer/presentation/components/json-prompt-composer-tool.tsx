"use client";

import { useMemo, useState } from "react";

import { buildPromptJson } from "@/modules/json-prompt-composer/domain/prompt-composer";
import en from "@/modules/json-prompt-composer/presentation/i18n/en.json";
import es from "@/modules/json-prompt-composer/presentation/i18n/es.json";
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

export function JsonPromptComposerTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const shared = sharedMessages[language];

  const [role, setRole] = useState("You are a senior frontend engineer.");
  const [goal, setGoal] = useState(
    "Refactor this component for readability and performance.",
  );
  const [context, setContext] = useState(
    "React + TypeScript + Tailwind project.",
  );
  const [constraints, setConstraints] = useState(
    "Do not add dependencies\nKeep behavior unchanged",
  );
  const [outputFormat, setOutputFormat] = useState("Bullet list + code diff");
  const [output, setOutput] = useState("");

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-3">
        <ToolField label={text.role}>
          <ToolInput
            onChange={(event) => setRole(event.target.value)}
            value={role}
          />
        </ToolField>
        <ToolField label={text.goal}>
          <ToolInput
            onChange={(event) => setGoal(event.target.value)}
            value={goal}
          />
        </ToolField>
        <ToolField label={text.context}>
          <ToolInput
            onChange={(event) => setContext(event.target.value)}
            value={context}
          />
        </ToolField>
        <ToolField label={text.constraints}>
          <ToolTextarea
            className="h-24"
            onChange={(event) => setConstraints(event.target.value)}
            value={constraints}
          />
        </ToolField>
        <ToolField label={text.outputFormat}>
          <ToolInput
            onChange={(event) => setOutputFormat(event.target.value)}
            value={outputFormat}
          />
        </ToolField>
      </div>

      <ToolActions
        actions={[
          {
            label: text.generate,
            onClick: () => {
              setOutput(
                buildPromptJson({
                  role,
                  goal,
                  context,
                  constraints,
                  outputFormat,
                }),
              );
            },
          },
          {
            label: shared.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(output);
            },
            disabled: !output,
          },
          {
            label: shared.buttons.download,
            onClick: () => {
              downloadTextFile(
                output,
                "prompt.json",
                "application/json;charset=utf-8",
              );
            },
            disabled: !output,
          },
          {
            label: shared.buttons.clear,
            onClick: () => setOutput(""),
            disabled: !output,
          },
        ]}
      />

      <ToolOutputBlock label={text.output} value={output} />
    </ToolSection>
  );
}
