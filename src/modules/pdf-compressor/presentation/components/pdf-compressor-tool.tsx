"use client";

import { useMemo, useState } from "react";

import {
  clampQuality,
  clampScale,
  compressedPdfName,
  isPdfFile,
} from "@/modules/pdf-compressor/domain/pdf-compressor";
import en from "@/modules/pdf-compressor/presentation/i18n/en.json";
import es from "@/modules/pdf-compressor/presentation/i18n/es.json";
import { downloadBlob } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolFileDrop,
  ToolSection,
  ToolSlider,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

export function PdfCompressorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const shared = sharedMessages[language];
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(0.75);
  const [quality, setQuality] = useState(0.7);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const compress = async () => {
    if (!file) return;
    setIsRunning(true);
    setError("");
    setResult(null);

    try {
      const pdfjs = await import("pdfjs-dist");
      const { PDFDocument } = await import("pdf-lib");

      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }

      const srcBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(srcBuffer),
      });
      const srcPdf = await loadingTask.promise;
      const outPdf = await PDFDocument.create();

      const safeScale = clampScale(scale);
      const safeQuality = clampQuality(quality);

      for (let i = 1; i <= srcPdf.numPages; i += 1) {
        const page = await srcPdf.getPage(i);
        const viewport = page.getViewport({ scale: safeScale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const context = canvas.getContext("2d");
        if (!context) continue;

        await page.render({ canvas, canvasContext: context, viewport }).promise;

        const jpegDataUrl = canvas.toDataURL("image/jpeg", safeQuality);
        const jpegBytes = Uint8Array.from(
          atob(jpegDataUrl.split(",")[1]),
          (c) => c.charCodeAt(0),
        );
        const image = await outPdf.embedJpg(jpegBytes);
        const outPage = outPdf.addPage([image.width, image.height]);
        outPage.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const bytes = await outPdf.save();
      const normalized = new Uint8Array(bytes.length);
      normalized.set(bytes);
      setResult(new Blob([normalized], { type: "application/pdf" }));
    } catch {
      setError(text.invalid);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <ToolSection title={text.title}>
      <ToolFileDrop
        accept="application/pdf,.pdf"
        currentFileText={file ? file.name : null}
        dropHint={text.dropHint}
        inputAriaLabel={text.input}
        label={text.input}
        onSelectFiles={(files) => {
          const selected = files[0];
          if (!selected || !isPdfFile(selected)) {
            setFile(null);
            setResult(null);
            setError(text.invalid);
            return;
          }
          setFile(selected);
          setResult(null);
          setError("");
        }}
      />

      <ToolField label={text.scale}>
        <ToolSlider
          displayValue={`${Math.round(scale * 100)}%`}
          max={1}
          min={0.3}
          onChange={setScale}
          step={0.05}
          value={scale}
        />
      </ToolField>

      <ToolField label={text.quality}>
        <ToolSlider
          displayValue={`${Math.round(quality * 100)}%`}
          max={0.95}
          min={0.3}
          onChange={setQuality}
          step={0.05}
          value={quality}
        />
      </ToolField>

      <ToolActions
        actions={[
          {
            label: isRunning ? "..." : text.compress,
            onClick: () => {
              void compress();
            },
            disabled: !file || isRunning,
          },
          {
            label: text.download,
            onClick: () => {
              if (!result || !file) return;
              downloadBlob(result, compressedPdfName(file.name));
            },
            disabled: !result || !file || isRunning,
          },
          {
            label: shared.buttons.clear,
            onClick: () => {
              setFile(null);
              setResult(null);
              setError("");
            },
            disabled: !file && !result && !error,
          },
        ]}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {result ? <p className="text-sm text-emerald-500">{text.done}</p> : null}
    </ToolSection>
  );
}
