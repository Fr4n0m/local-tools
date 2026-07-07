"use client";

import { useMemo, useState } from "react";

import { generatePlaceholderUseCase } from "@/modules/placeholder-text/application/generate-placeholder-use-case";
import type { PlaceholderMode } from "@/modules/placeholder-text/domain/placeholder-text";
import en from "@/modules/placeholder-text/presentation/i18n/en.json";
import es from "@/modules/placeholder-text/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { sanitizeIntInput } from "@/shared/lib/safe-input";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
  ToolSelect,
  ToolSwitch,
  ToolToggleField,
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
  const [bulletMode, setBulletMode] = useState(false);
  const [output, setOutput] = useState("");

  const applyPreset = (value: "short" | "medium" | "long") => {
    if (value === "short") {
      setParagraphs(1);
      setSentences(2);
      setWords(6);
      return;
    }
    if (value === "long") {
      setParagraphs(4);
      setSentences(5);
      setWords(12);
      return;
    }
    setParagraphs(3);
    setSentences(4);
    setWords(10);
  };

  const onGenerate = () => {
    setOutput(
      generatePlaceholderUseCase({
        mode,
        paragraphs,
        sentencesPerParagraph: sentences,
        wordsPerSentence: words,
        bulletMode,
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
            { value: "headlines", label: text.modes.headlines },
            { value: "names", label: text.modes.names },
            { value: "emails", label: text.modes.emails },
          ]}
          value={mode}
          onChange={(value) => setMode(value as PlaceholderMode)}
        />
      </ToolField>
      <ToolField label={text.preset}>
        <ToolSelect
          aria-label={text.preset}
          options={[
            { value: "short", label: text.presetShort },
            { value: "medium", label: text.presetMedium },
            { value: "long", label: text.presetLong },
          ]}
          value="medium"
          onChange={(value) => {
            if (value === "short" || value === "medium" || value === "long") {
              applyPreset(value);
            }
          }}
        />
      </ToolField>
      <ToolToggleField label={text.bulletMode}>
        <ToolSwitch checked={bulletMode} onChange={setBulletMode} />
      </ToolToggleField>

      <div className="grid gap-4 md:grid-cols-3">
        <ToolField label={text.paragraphs}>
          <ToolInput
            min={1}
            type="number"
            value={paragraphs}
            onChange={(event) =>
              setParagraphs(sanitizeIntInput(event.target.value, 3, 1, 50))
            }
          />
        </ToolField>
        <ToolField label={text.sentences}>
          <ToolInput
            min={1}
            type="number"
            value={sentences}
            onChange={(event) =>
              setSentences(sanitizeIntInput(event.target.value, 4, 1, 20))
            }
          />
        </ToolField>
        <ToolField label={text.words}>
          <ToolInput
            min={3}
            type="number"
            value={words}
            onChange={(event) =>
              setWords(sanitizeIntInput(event.target.value, 10, 3, 30))
            }
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
            label: sharedText.buttons.download,
            onClick: () => {
              downloadTextFile(output, "placeholder-text.txt");
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
              setBulletMode(false);
              setOutput("");
            },
            disabled:
              mode === "lorem" &&
              paragraphs === 3 &&
              sentences === 4 &&
              words === 10 &&
              !bulletMode &&
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
