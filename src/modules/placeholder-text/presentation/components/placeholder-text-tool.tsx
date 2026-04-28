"use client";

import { useMemo, useState } from "react";

import { generatePlaceholderUseCase } from "@/modules/placeholder-text/application/generate-placeholder-use-case";
import type { PlaceholderMode } from "@/modules/placeholder-text/domain/placeholder-text";
import en from "@/modules/placeholder-text/presentation/i18n/en.json";
import es from "@/modules/placeholder-text/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
  ToolSelect,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function PlaceholderTextTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [mode, setMode] = useState<PlaceholderMode>("lorem");
  const [paragraphs, setParagraphs] = useState(3);
  const [sentences, setSentences] = useState(4);
  const [words, setWords] = useState(10);
  const [output, setOutput] = useState("");

  const onGenerate = () => {
    setOutput(
      generatePlaceholderUseCase({
        mode,
        paragraphs,
        sentencesPerParagraph: sentences,
        wordsPerSentence: words,
      }),
    );
  };

  return (
    <ToolSection title={text.title}>
      <ToolField label={text.mode}>
        <ToolSelect
          aria-label={text.mode}
          options={[
            { value: "lorem", label: text.modes.lorem },
            { value: "english-ish", label: text.modes["english-ish"] },
            { value: "cat", label: text.modes.cat },
          ]}
          value={mode}
          onChange={(value) => setMode(value as PlaceholderMode)}
        />
      </ToolField>

      <div className="grid gap-4 md:grid-cols-3">
        <ToolField label={text.paragraphs}>
          <ToolInput
            min={1}
            type="number"
            value={paragraphs}
            onChange={(event) => setParagraphs(Number(event.target.value || 1))}
          />
        </ToolField>
        <ToolField label={text.sentences}>
          <ToolInput
            min={1}
            type="number"
            value={sentences}
            onChange={(event) => setSentences(Number(event.target.value || 1))}
          />
        </ToolField>
        <ToolField label={text.words}>
          <ToolInput
            min={3}
            type="number"
            value={words}
            onChange={(event) => setWords(Number(event.target.value || 3))}
          />
        </ToolField>
      </div>

      <ToolActions
        actions={[
          { label: text.generate, onClick: onGenerate },
          {
            label: sharedText.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(output);
            },
            disabled: output.length === 0,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setMode("lorem");
              setParagraphs(3);
              setSentences(4);
              setWords(10);
              setOutput("");
            },
            disabled:
              mode === "lorem" &&
              paragraphs === 3 &&
              sentences === 4 &&
              words === 10 &&
              output.length === 0,
          },
        ]}
      />

      {output ? (
        <ToolOutputBlock label={text.output} value={output} />
      ) : (
        <p className="text-sm">{text.empty}</p>
      )}
    </ToolSection>
  );
}
