"use client";

import { useMemo, useState } from "react";

import {
  isSvgContentValid,
  normalizeSvgContent,
  toPngName,
  toSvgDataUrl,
  toSvgName,
} from "@/modules/svg-to-file/domain/svg-file";
import en from "@/modules/svg-to-file/presentation/i18n/en.json";
import es from "@/modules/svg-to-file/presentation/i18n/es.json";
import { downloadBlob, downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolInput,
  ToolSection,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
  <rect width="320" height="180" rx="24" fill="#14213d"/>
  <circle cx="84" cy="90" r="44" fill="#fca311"/>
  <text x="150" y="99" fill="#ffffff" font-family="ui-sans-serif, system-ui" font-size="24">LocalTools</text>
</svg>`;

export function SvgToFileTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [svgInput, setSvgInput] = useState(SAMPLE_SVG);
  const [filename, setFilename] = useState("localtools-graphic");
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(360);

  const svg = normalizeSvgContent(svgInput);
  const isValid = isSvgContentValid(svg);
  const previewUrl = isValid ? toSvgDataUrl(svg) : "";

  const onDownloadSvg = () => {
    if (!isValid) return;
    downloadTextFile(svg, toSvgName(filename), "image/svg+xml;charset=utf-8");
  };

  const onDownloadPng = async () => {
    if (!isValid) return;
    const safeWidth = Math.max(32, Math.min(4000, width));
    const safeHeight = Math.max(32, Math.min(4000, height));

    const image = new Image();
    image.src = previewUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to render SVG"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = safeWidth;
    canvas.height = safeHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, safeWidth, safeHeight);
    ctx.drawImage(image, 0, 0, safeWidth, safeHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), "image/png"),
    );
    if (!blob) return;
    downloadBlob(blob, toPngName(filename));
  };

  return (
    <ToolSection title={text.title}>
      <ToolField htmlFor="svg-input" label={text.svgInput}>
        <ToolTextarea
          className="h-56"
          id="svg-input"
          onChange={(event) => setSvgInput(event.target.value)}
          spellCheck={false}
          value={svgInput}
        />
      </ToolField>

      <div className="grid gap-3 md:grid-cols-3">
        <ToolField htmlFor="svg-filename" label={text.filename}>
          <ToolInput
            id="svg-filename"
            onChange={(event) => setFilename(event.target.value)}
            value={filename}
          />
        </ToolField>
        <ToolField htmlFor="svg-width" label={text.width}>
          <ToolInput
            id="svg-width"
            max={4000}
            min={32}
            onChange={(event) => setWidth(Number(event.target.value))}
            type="number"
            value={width}
          />
        </ToolField>
        <ToolField htmlFor="svg-height" label={text.height}>
          <ToolInput
            id="svg-height"
            max={4000}
            min={32}
            onChange={(event) => setHeight(Number(event.target.value))}
            type="number"
            value={height}
          />
        </ToolField>
      </div>

      <ToolActions
        actions={[
          { label: text.exportSvg, onClick: onDownloadSvg, disabled: !isValid },
          {
            label: text.exportPng,
            onClick: () => void onDownloadPng(),
            disabled: !isValid,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setSvgInput("");
              setFilename("image");
              setWidth(640);
              setHeight(360);
            },
          },
        ]}
      />

      {!svg ? (
        <p className="text-sm text-muted-foreground">{text.empty}</p>
      ) : !isValid ? (
        <p className="text-sm text-destructive">{text.invalidSvg}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm">{text.preview}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={text.preview}
            className="max-h-80 w-full rounded-md border bg-background/40 object-contain p-2"
            src={previewUrl}
          />
        </div>
      )}
    </ToolSection>
  );
}
