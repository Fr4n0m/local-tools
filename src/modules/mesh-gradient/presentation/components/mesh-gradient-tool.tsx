"use client";

import { useCallback, useMemo, useState } from "react";

import {
  buildMeshGradientCss,
  buildMeshGradientSvg,
  type MeshStop,
} from "@/modules/mesh-gradient/domain/mesh-gradient";
import en from "@/modules/mesh-gradient/presentation/i18n/en.json";
import es from "@/modules/mesh-gradient/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolColorPicker,
  ToolOutputBlock,
  ToolSection,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";

const INITIAL_STOPS: MeshStop[] = [
  { color: "#fca311", x: 18, y: 24 },
  { color: "#3a86ff", x: 82, y: 28 },
  { color: "#ff006e", x: 30, y: 76 },
  { color: "#06d6a0", x: 76, y: 74 },
];

function randomizeMeshStops(stops: MeshStop[]): MeshStop[] {
  return stops.map((stop) => ({
    ...stop,
    x: Math.floor(Math.random() * 101),
    y: Math.floor(Math.random() * 101),
  }));
}

type Props = { language: Language };

export function MeshGradientTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [stops, setStops] = useState<MeshStop[]>(INITIAL_STOPS);

  const css = useMemo(() => buildMeshGradientCss(stops), [stops]);
  const svg = useMemo(() => buildMeshGradientSvg(stops), [stops]);
  const previewStyle = useMemo(
    () => ({
      backgroundColor: "#0b0f14",
      backgroundImage: buildMeshGradientCss(stops)
        .replace("background-color: #0b0f14;\nbackground-image: ", "")
        .replace(/;$/, ""),
    }),
    [stops],
  );
  const randomizeStops = useCallback(() => {
    setStops((previous) => randomizeMeshStops(previous));
  }, []);

  return (
    <ToolSection title={text.title}>
      <p className="text-sm text-muted-foreground">{text.stops}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {stops.map((stop, index) => (
          <div className="rounded-md border p-3" key={`${stop.color}-${index}`}>
            <div className="grid grid-cols-3 gap-2">
              <ToolColorPicker
                onChange={(value) => {
                  const next = [...stops];
                  next[index] = { ...next[index], color: value };
                  setStops(next);
                }}
                value={stop.color}
              />
              <input
                className="w-full rounded-md border bg-background/40 p-2 text-sm"
                max={100}
                min={0}
                onChange={(event) => {
                  const next = [...stops];
                  next[index] = {
                    ...next[index],
                    x: Number(event.target.value),
                  };
                  setStops(next);
                }}
                type="number"
                value={stop.x}
              />
              <input
                className="w-full rounded-md border bg-background/40 p-2 text-sm"
                max={100}
                min={0}
                onChange={(event) => {
                  const next = [...stops];
                  next[index] = {
                    ...next[index],
                    y: Number(event.target.value),
                  };
                  setStops(next);
                }}
                type="number"
                value={stop.y}
              />
            </div>
          </div>
        ))}
      </div>

      <ToolActions
        actions={[
          {
            label: text.randomize,
            onClick: randomizeStops,
          },
          {
            label: text.copyCss,
            onClick: () => {
              void copyTextToClipboard(css);
            },
          },
          {
            label: text.downloadSvg,
            onClick: () => {
              downloadTextFile(
                svg,
                "mesh-gradient.svg",
                "image/svg+xml;charset=utf-8",
              );
            },
          },
        ]}
      />

      <div className="h-56 w-full rounded-xl border" style={previewStyle}>
        <span className="sr-only">{text.preview}</span>
      </div>

      <ToolOutputBlock label={text.outputCss} value={css} />
    </ToolSection>
  );
}
