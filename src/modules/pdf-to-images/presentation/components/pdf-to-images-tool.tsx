"use client";

import { useMemo, useState } from "react";

import {
  clampScale,
  isPdfFile,
  toPageImageName,
} from "@/modules/pdf-to-images/domain/pdf-file";
import en from "@/modules/pdf-to-images/presentation/i18n/en.json";
import es from "@/modules/pdf-to-images/presentation/i18n/es.json";
import { downloadBlob } from "@/shared/lib/download";
import { createZipBlob } from "@/shared/lib/zip";
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

type ConvertedPage = { name: string; blob: Blob };

export function PdfToImagesTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1.5);
  const [error, setError] = useState("");
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const convert = async () => {
    if (!file) return;
    setIsConverting(true);
    setError("");

    try {
      const pdfjs = await import("pdfjs-dist");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;

      const pages: ConvertedPage[] = [];
      const targetScale = clampScale(scale);

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: targetScale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        await page.render({ canvas, canvasContext: context, viewport }).promise;

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((value) => resolve(value), "image/png"),
        );

        if (blob) {
          pages.push({ name: toPageImageName(file.name, pageNum), blob });
        }
      }

      setConvertedPages(pages);
      if (pages.length === 0) {
        setError(text.unsupported);
      }
    } catch {
      setError(text.unsupported);
      setConvertedPages([]);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadZip = async () => {
    if (convertedPages.length === 0) return;
    const zipBlob = await createZipBlob(convertedPages);
    downloadBlob(zipBlob, "pdf-images.zip");
  };

  return (
    <ToolSection title={text.title}>
      <ToolFileDrop
        accept="application/pdf,.pdf"
        currentFileText={file ? file.name : null}
        dropHint={text.dropHint}
        inputAriaLabel={text.inputLabel}
        label={text.inputLabel}
        onSelectFiles={(files) => {
          const selected = files[0];
          if (!selected || !isPdfFile(selected)) {
            setError(text.unsupported);
            setFile(null);
            setConvertedPages([]);
            return;
          }
          setError("");
          setFile(selected);
          setConvertedPages([]);
        }}
      />

      <ToolField label={text.scale}>
        <ToolSlider
          displayValue={`${Math.round(scale * 100)}%`}
          max={3}
          min={1}
          step={0.25}
          value={scale}
          onChange={setScale}
        />
      </ToolField>

      <ToolActions
        actions={[
          {
            label: isConverting ? "..." : text.convert,
            onClick: () => {
              void convert();
            },
            disabled: !file || isConverting,
          },
          {
            label: text.downloadZip,
            onClick: () => {
              void downloadZip();
            },
            disabled: convertedPages.length === 0 || isConverting,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              setFile(null);
              setError("");
              setConvertedPages([]);
              setScale(1.5);
            },
            disabled: !file && convertedPages.length === 0,
          },
        ]}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {convertedPages.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          {text.converted.replace("{count}", String(convertedPages.length))}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{text.empty}</p>
      )}
    </ToolSection>
  );
}
