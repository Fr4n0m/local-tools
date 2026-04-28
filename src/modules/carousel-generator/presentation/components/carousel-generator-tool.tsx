"use client";

import { useMemo, useState } from "react";

import {
  buildCarouselHtml,
  parseImageLines,
} from "@/modules/carousel-generator/domain/carousel";
import en from "@/modules/carousel-generator/presentation/i18n/en.json";
import es from "@/modules/carousel-generator/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolField,
  ToolOutputBlock,
  ToolSection,
  ToolTextarea,
  ToolToggleField,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

const SAMPLE_URLS = [
  "https://picsum.photos/id/1015/1200/800",
  "https://picsum.photos/id/1025/1200/800",
  "https://picsum.photos/id/1035/1200/800",
].join("\n");

export function CarouselGeneratorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [urlsInput, setUrlsInput] = useState(SAMPLE_URLS);
  const [autoplayMs, setAutoplayMs] = useState(3000);
  const [showDots, setShowDots] = useState(true);
  const [output, setOutput] = useState("");

  return (
    <ToolSection title={text.title}>
      <ToolField label={text.imageUrls}>
        <ToolTextarea
          className="h-32"
          onChange={(event) => setUrlsInput(event.target.value)}
          placeholder={text.placeholder}
          value={urlsInput}
        />
      </ToolField>
      <ToolField label={text.autoplayMs}>
        <input
          className="w-full rounded-md border bg-background/40 p-3"
          max={15000}
          min={1000}
          onChange={(event) => setAutoplayMs(Number(event.target.value))}
          step={100}
          type="number"
          value={autoplayMs}
        />
      </ToolField>
      <ToolToggleField label={text.showDots}>
        <input
          checked={showDots}
          onChange={(event) => setShowDots(event.target.checked)}
          type="checkbox"
        />
      </ToolToggleField>
      <ToolActions
        actions={[
          {
            label: text.generate,
            onClick: () => {
              const imageUrls = parseImageLines(urlsInput);
              setOutput(
                buildCarouselHtml({
                  imageUrls,
                  autoplayMs,
                  showDots,
                }),
              );
            },
          },
          {
            label: sharedText.buttons.copy,
            onClick: () => {
              void copyTextToClipboard(output);
            },
            disabled: !output,
          },
          {
            label: sharedText.buttons.download,
            onClick: () => {
              downloadTextFile(
                output,
                "carousel.html",
                "text/html;charset=utf-8",
              );
            },
            disabled: !output,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => setOutput(""),
            disabled: !output,
          },
        ]}
      />
      <ToolOutputBlock label={text.output} value={output} />
    </ToolSection>
  );
}
