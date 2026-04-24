"use client";

import { useEffect, useMemo, useState } from "react";

import en from "@/modules/favicon-generator/presentation/i18n/en.json";
import es from "@/modules/favicon-generator/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { createZipBlob } from "@/shared/lib/zip";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

type GeneratedIcon = {
  size: number;
  url: string;
  blob: Blob;
};

const sizes = [16, 32, 48, 64, 128, 180, 192, 256, 512];

export function FaviconGeneratorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [generated, setGenerated] = useState<GeneratedIcon[]>([]);

  const projectName = useMemo(() => {
    if (!file) {
      return "LocalTools";
    }
    const lastDot = file.name.lastIndexOf(".");
    return lastDot > 0 ? file.name.slice(0, lastDot) : file.name;
  }, [file]);

  const manifestContent = useMemo(() => {
    if (generated.length === 0) {
      return "";
    }

    const icons = generated.map((icon) => ({
      src: `favicon-${icon.size}.png`,
      sizes: `${icon.size}x${icon.size}`,
      type: "image/png",
    }));

    return JSON.stringify(
      {
        name: projectName,
        short_name: projectName,
        start_url: ".",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0a9396",
        icons,
      },
      null,
      2,
    );
  }, [generated, projectName]);

  const htmlSnippet = useMemo(() => {
    if (generated.length === 0) {
      return "";
    }

    const links = generated
      .slice()
      .sort((a, b) => a.size - b.size)
      .map(
        (icon) =>
          `<link rel=\"icon\" type=\"image/png\" sizes=\"${icon.size}x${icon.size}\" href=\"/favicon-${icon.size}.png\" />`,
      );

    const apple = generated.find((icon) => icon.size === 180);
    if (apple) {
      links.push(
        `<link rel=\"apple-touch-icon\" href=\"/favicon-${apple.size}.png\" />`,
      );
    }

    links.push(`<link rel=\"manifest\" href=\"/site.webmanifest\" />`);

    return links.join("\n");
  }, [generated]);

  useEffect(() => {
    return () => {
      generated.forEach((icon) => URL.revokeObjectURL(icon.url));
    };
  }, [generated]);

  const onGenerate = async () => {
    if (!file) {
      return;
    }

    generated.forEach((icon) => URL.revokeObjectURL(icon.url));

    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);
    image.src = sourceUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => {
        URL.revokeObjectURL(sourceUrl);
        resolve();
      };
      image.onerror = () => {
        URL.revokeObjectURL(sourceUrl);
        reject(new Error("image-load-error"));
      };
    });

    const icons: GeneratedIcon[] = [];
    for (const size of sizes) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) {
        continue;
      }
      context.drawImage(image, 0, 0, size, size);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });
      if (!blob) {
        continue;
      }
      icons.push({ size, url: URL.createObjectURL(blob), blob });
    }

    setGenerated(icons);
  };

  const onDropFile = (nextFile: File | null) => {
    if (!nextFile || !nextFile.type.startsWith("image/")) {
      return;
    }
    setFile(nextFile);
  };

  const onDownloadZip = async () => {
    if (generated.length === 0) {
      return;
    }

    const zipBlob = await createZipBlob(
      generated.map((icon) => ({
        name: `favicon-${icon.size}.png`,
        blob: icon.blob,
      })),
    );
    const zipUrl = URL.createObjectURL(zipBlob);
    const anchor = document.createElement("a");
    anchor.href = zipUrl;
    anchor.download = "favicons.zip";
    anchor.click();
    URL.revokeObjectURL(zipUrl);
  };

  const onDownloadManifest = () => {
    if (!manifestContent) {
      return;
    }
    downloadTextFile(
      manifestContent,
      "site.webmanifest",
      "application/manifest+json",
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{text.title}</h2>
      <label className="block space-y-2">
        <span className="text-sm">{text.inputLabel}</span>
        <div
          className={`rounded-md border p-3 ${isDragging ? "bg-secondary/40" : "bg-background/50"}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            onDropFile(event.dataTransfer.files?.[0] ?? null);
          }}
        >
          <input
            className="w-full rounded-md border bg-background/60 p-3"
            type="file"
            accept="image/*"
            onChange={(event) => onDropFile(event.target.files?.[0] ?? null)}
          />
          <p className="mt-2 text-xs">{text.dropHint}</p>
          {file ? (
            <p className="mt-1 text-xs">
              {text.currentFile}: {file.name}
            </p>
          ) : null}
        </div>
      </label>
      <ToolActions
        actions={[
          {
            label: text.generate,
            onClick: () => {
              void onGenerate();
            },
            disabled: !file,
          },
          {
            label: sharedText.buttons.download,
            onClick: () => {
              void onDownloadZip();
            },
            disabled: generated.length === 0,
          },
          {
            label: sharedText.buttons.clear,
            onClick: () => {
              generated.forEach((icon) => URL.revokeObjectURL(icon.url));
              setFile(null);
              setGenerated([]);
            },
            disabled: !file && generated.length === 0,
          },
        ]}
      />
      {generated.length === 0 ? (
        <p className="text-sm">{text.empty}</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">{text.result}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {generated.map((icon) => (
              <a
                className="flex items-center justify-between rounded-md border p-3 text-sm"
                download={`favicon-${icon.size}.png`}
                href={icon.url}
                key={icon.size}
              >
                <span>
                  {icon.size}x{icon.size}
                </span>
                <span>PNG</span>
              </a>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 rounded-md border bg-background/40 p-3">
              <p className="text-sm">{text.manifest}</p>
              <textarea
                className="h-40 w-full rounded-md border bg-background/60 p-3 text-xs"
                readOnly
                value={manifestContent}
              />
              <ToolActions
                actions={[
                  {
                    label: text.copyManifest,
                    onClick: () => {
                      void copyTextToClipboard(manifestContent);
                    },
                    disabled: manifestContent.length === 0,
                  },
                  {
                    label: text.downloadManifest,
                    onClick: onDownloadManifest,
                    disabled: manifestContent.length === 0,
                  },
                ]}
              />
            </div>
            <div className="space-y-2 rounded-md border bg-background/40 p-3">
              <p className="text-sm">{text.snippet}</p>
              <textarea
                className="h-40 w-full rounded-md border bg-background/60 p-3 text-xs"
                readOnly
                value={htmlSnippet}
              />
              <ToolActions
                actions={[
                  {
                    label: text.copySnippet,
                    onClick: () => {
                      void copyTextToClipboard(htmlSnippet);
                    },
                    disabled: htmlSnippet.length === 0,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
