"use client";

import { useCallback, useMemo, useState } from "react";

import {
  buildMeshGradientCss,
  buildMeshGradientSvg,
  type MeshGradientExportFormat,
  type MeshStop,
} from "@/modules/mesh-gradient/domain/mesh-gradient";
import en from "@/modules/mesh-gradient/presentation/i18n/en.json";
import es from "@/modules/mesh-gradient/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadBlob, downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolColorPicker,
  ToolOutputBlock,
  ToolSection,
  ToolSelect,
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

function randomHexColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 21);
  const lightness = 48 + Math.floor(Math.random() * 18);
  const color = `hsl(${hue} ${saturation}% ${lightness}%)`;
  const probe = document.createElement("span");
  probe.style.color = color;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const computed = window.getComputedStyle(probe).color;
  probe.remove();
  const match = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
  if (!match) return "#ffffff";
  return `#${match
    .slice(1)
    .map((value) => Number(value).toString(16).padStart(2, "0"))
    .join("")}`;
}

function randomizeAllMeshStops(stops: MeshStop[]): MeshStop[] {
  return randomizeMeshStops(stops).map((stop) => ({
    ...stop,
    color: randomHexColor(),
  }));
}

function extensionForFormat(format: MeshGradientExportFormat): string {
  switch (format) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "svg";
  }
}

function sanitizeDimension(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(64, Math.min(4000, Math.round(value)));
}

type Props = { language: Language };

export function MeshGradientTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const [stops, setStops] = useState<MeshStop[]>(INITIAL_STOPS);
  const [exportFormat, setExportFormat] =
    useState<MeshGradientExportFormat>("image/svg+xml");
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const safeWidth = useMemo(() => sanitizeDimension(width, 1200), [width]);
  const safeHeight = useMemo(() => sanitizeDimension(height, 800), [height]);

  const css = useMemo(() => buildMeshGradientCss(stops), [stops]);
  const svg = useMemo(
    () => buildMeshGradientSvg(stops, safeWidth, safeHeight),
    [safeHeight, safeWidth, stops],
  );
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

  const randomizeAllStops = useCallback(() => {
    setStops((previous) => randomizeAllMeshStops(previous));
  }, []);

  const onDownload = useCallback(async () => {
    const filename = `mesh-gradient.${extensionForFormat(exportFormat)}`;
    if (exportFormat === "image/svg+xml") {
      downloadTextFile(svg, filename, "image/svg+xml;charset=utf-8");
      return;
    }

    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("mesh-gradient-render-error"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = safeWidth;
    canvas.height = safeHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(
        resolve,
        exportFormat,
        exportFormat === "image/png" ? undefined : 0.96,
      ),
    );
    if (!blob) return;
    downloadBlob(blob, filename);
  }, [exportFormat, safeHeight, safeWidth, svg]);

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
                aria-label={`${text.stops} X ${index + 1}`}
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
                aria-label={`${text.stops} Y ${index + 1}`}
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
            label: text.randomizeAll,
            onClick: randomizeAllStops,
          },
        ]}
      />

      <div className="h-56 w-full rounded-xl border" style={previewStyle}>
        <span className="sr-only">{text.preview}</span>
      </div>

      <ToolOutputBlock label={text.outputCss} value={css} />

      <div className="grid gap-3 md:grid-cols-3">
        <ToolField label={text.exportFormat}>
          <ToolSelect
            aria-label={text.exportFormat}
            onChange={(value) =>
              setExportFormat(value as MeshGradientExportFormat)
            }
            options={[
              { value: "image/svg+xml", label: "SVG" },
              { value: "image/png", label: "PNG" },
              { value: "image/jpeg", label: "JPEG" },
              { value: "image/webp", label: "WEBP" },
            ]}
            value={exportFormat}
          />
        </ToolField>
        <ToolField label={text.exportWidth}>
          <ToolInput
            max={4000}
            min={64}
            onChange={(event) => setWidth(Number(event.target.value))}
            type="number"
            value={width}
          />
        </ToolField>
        <ToolField label={text.exportHeight}>
          <ToolInput
            max={4000}
            min={64}
            onChange={(event) => setHeight(Number(event.target.value))}
            type="number"
            value={height}
          />
        </ToolField>
      </div>

      <ToolActions
        actions={[
          {
            label: text.copyCss,
            onClick: () => {
              void copyTextToClipboard(css);
            },
          },
          {
            label: text.downloadFile,
            onClick: () => {
              void onDownload();
            },
          },
        ]}
      />
    </ToolSection>
  );
}
