"use client";

import { useMemo, useState } from "react";

import {
  chordName,
  chordNotes,
  noteOptions,
  type ChordType,
} from "@/modules/chord-explorer/domain/chord";
import en from "@/modules/chord-explorer/presentation/i18n/en.json";
import es from "@/modules/chord-explorer/presentation/i18n/es.json";
import {
  ToolField,
  ToolOutputBlock,
  ToolSection,
  ToolSelect,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function ChordExplorerTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [root, setRoot] = useState("C");
  const [type, setType] = useState<ChordType>("major");

  const notes = chordNotes(root, type);
  const name = chordName(root, type);

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-3 md:grid-cols-2">
        <ToolField label={text.root}>
          <ToolSelect
            onChange={setRoot}
            options={noteOptions().map((note) => ({
              value: note,
              label: note,
            }))}
            value={root}
          />
        </ToolField>
        <ToolField label={text.type}>
          <ToolSelect
            onChange={(value) => {
              if (
                value === "major" ||
                value === "minor" ||
                value === "maj7" ||
                value === "min7" ||
                value === "dom7"
              ) {
                setType(value);
              }
            }}
            options={[
              { value: "major", label: text.major },
              { value: "minor", label: text.minor },
              { value: "maj7", label: text.maj7 },
              { value: "min7", label: text.min7 },
              { value: "dom7", label: text.dom7 },
            ]}
            value={type}
          />
        </ToolField>
      </div>

      <ToolOutputBlock
        label={`${name} • ${text.result}`}
        value={notes.join(" - ")}
      />
    </ToolSection>
  );
}
