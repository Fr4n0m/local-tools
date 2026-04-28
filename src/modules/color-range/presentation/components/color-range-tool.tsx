"use client";

import { useMemo, useState } from "react";

import {
  generateColorRange,
  toCssVariables,
} from "@/modules/color-range/domain/color-range";
import en from "@/modules/color-range/presentation/i18n/en.json";
import es from "@/modules/color-range/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function ColorRangeTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [baseColor, setBaseColor] = useState("#3b82f6");
  const [scaleName, setScaleName] = useState("brand");
  const [steps, setSteps] = useState(9);

  const colors = useMemo(
    () => generateColorRange(baseColor, steps),
    [baseColor, steps],
  );
  const cssVariables = useMemo(
    () => toCssVariables(scaleName, colors),
    [scaleName, colors],
  );

  return (
    <ToolSection title={text.title}>
      <div className="grid gap-3 md:grid-cols-3">
        <ToolField htmlFor="color-range-base" label={text.baseColor}>
          <ToolInput
            id="color-range-base"
            onChange={(event) => setBaseColor(event.target.value)}
            type="color"
            value={baseColor}
          />
        </ToolField>
        <ToolField htmlFor="color-range-name" label={text.scaleName}>
          <ToolInput
            id="color-range-name"
            onChange={(event) => setScaleName(event.target.value)}
            placeholder="brand"
            value={scaleName}
          />
        </ToolField>
        <ToolField htmlFor="color-range-steps" label={text.steps}>
          <ToolInput
            id="color-range-steps"
            max={11}
            min={3}
            onChange={(event) => setSteps(Number(event.target.value))}
            step={2}
            type="number"
            value={steps}
          />
        </ToolField>
      </div>

      {colors.length === 0 ? (
        <p className="text-sm text-muted-foreground">{text.empty}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((item) => (
            <div
              className="rounded-md border p-2"
              key={`${item.step}-${item.hex}`}
              style={{ backgroundColor: item.hex }}
            >
              <div className="rounded-sm bg-black/30 p-2 text-xs text-white">
                <p>{item.step}</p>
                <p>{item.hex}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToolActions
        actions={[
          {
            label: text.copyCss,
            onClick: () => {
              void copyTextToClipboard(cssVariables);
            },
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setBaseColor("#3b82f6");
              setScaleName("brand");
              setSteps(9);
            },
          },
        ]}
      />

      <ToolOutputBlock label={text.outputLabel} value={cssVariables} />
    </ToolSection>
  );
}
