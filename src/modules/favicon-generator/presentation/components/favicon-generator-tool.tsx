"use client";

import { useEffect, useMemo, useState } from "react";
import NextImage from "next/image";

import {
  buildBrowserConfigContent,
  buildFaviconPackage,
  buildHtmlSnippet,
  clampFaviconRoundness,
  clampFaviconScale,
  createDefaultFaviconRenderSettings,
  drawFaviconSource,
  buildManifestContent,
  FAVICON_SIZES,
  faviconFileName,
  type FaviconFitMode,
  type FaviconRenderSettings,
  normalizeAppName,
  normalizeShortName,
  type GeneratedFaviconAsset as GeneratedFaviconPackageAsset,
} from "@/modules/favicon-generator/domain/favicon-generator";
import en from "@/modules/favicon-generator/presentation/i18n/en.json";
import es from "@/modules/favicon-generator/presentation/i18n/es.json";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { createZipBlob } from "@/shared/lib/zip";
import { ToolDropSurface } from "@/shared/presentation/components/tool-drop-surface";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import {
  ToolColorPicker,
  ToolField,
  ToolFileDrop,
  ToolSection,
  ToolSlider,
  ToolSwitch,
  ToolToggleField,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";

type Props = { language: Language };

type GeneratedIcon = GeneratedFaviconPackageAsset & {
  url: string;
};

const FAVICON_FIT_OPTIONS: FaviconFitMode[] = ["contain", "crop", "stretch"];

function FaviconPreviewTab({
  label,
  iconUrl,
  dark = false,
}: {
  label: string;
  iconUrl: string | null;
  dark?: boolean;
}) {
  return (
    <div
      className={`relative flex min-w-[182px] items-center gap-3 rounded-t-2xl border px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.18)] ${
        dark
          ? "border-white/10 bg-[#1f1f23] text-white/80"
          : "border-black/10 bg-white text-black/72"
      }`}
    >
      <div
        className={`grid h-7 w-7 place-items-center rounded-md border ${
          dark
            ? "border-white/12 bg-white/6"
            : "border-black/10 bg-black/[0.03]"
        }`}
      >
        {iconUrl ? (
          <NextImage
            alt=""
            className="rounded-[4px]"
            height={16}
            src={iconUrl}
            unoptimized
            width={16}
          />
        ) : (
          <div
            className={`h-4 w-4 rounded-[4px] ${
              dark ? "bg-white/18" : "bg-black/12"
            }`}
          />
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{label}</div>
        <div
          className={`mt-0.5 h-1.5 w-16 rounded-full ${
            dark ? "bg-white/10" : "bg-black/8"
          }`}
        />
      </div>
    </div>
  );
}

function FaviconFitModeButtons({
  value,
  onChange,
}: {
  value: FaviconFitMode;
  onChange: (value: FaviconFitMode) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl border bg-background/35 p-1.5">
      {FAVICON_FIT_OPTIONS.map((option) => {
        const active = option === value;
        return (
          <button
            className={`rounded-lg px-3 py-2 text-sm capitalize transition-colors ${
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-foreground/68 hover:bg-foreground/8"
            }`}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function FaviconGeneratorTool({ language }: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [file, setFile] = useState<File | null>(null);
  const [generated, setGenerated] = useState<GeneratedIcon[]>([]);
  const [appName, setAppName] = useState("LocalTools");
  const [shortName, setShortName] = useState("LT");
  const [themeColor, setThemeColor] = useState("#111111");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [previewIconUrl, setPreviewIconUrl] = useState<string | null>(null);
  const [renderSettings, setRenderSettings] = useState<FaviconRenderSettings>(
    () => createDefaultFaviconRenderSettings(),
  );

  const projectName = useMemo(() => {
    if (!file) {
      return normalizeAppName(appName);
    }
    const lastDot = file.name.lastIndexOf(".");
    return normalizeAppName(
      lastDot > 0 ? file.name.slice(0, lastDot) : file.name,
    );
  }, [appName, file]);

  const manifestContent = useMemo(() => {
    if (generated.length === 0) {
      return "";
    }

    return buildManifestContent(generated, {
      appName: projectName,
      shortName: normalizeShortName(shortName, projectName),
      themeColor,
      backgroundColor,
    });
  }, [backgroundColor, generated, projectName, shortName, themeColor]);

  const browserConfigContent = useMemo(() => {
    if (generated.length === 0) {
      return "";
    }

    return buildBrowserConfigContent(generated, {
      appName: projectName,
      shortName: normalizeShortName(shortName, projectName),
      themeColor,
      backgroundColor,
    });
  }, [backgroundColor, generated, projectName, shortName, themeColor]);

  const htmlSnippet = useMemo(() => {
    if (generated.length === 0) {
      return "";
    }

    return buildHtmlSnippet(generated, {
      appName: projectName,
      shortName: normalizeShortName(shortName, projectName),
      themeColor,
      backgroundColor,
    });
  }, [backgroundColor, generated, projectName, shortName, themeColor]);

  useEffect(() => {
    return () => {
      generated.forEach((icon) => {
        URL.revokeObjectURL(icon.url);
      });
      if (previewIconUrl) {
        URL.revokeObjectURL(previewIconUrl);
      }
    };
  }, [generated, previewIconUrl]);

  useEffect(() => {
    if (!file) {
      return;
    }

    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);
    image.src = sourceUrl;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 96;
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      drawFaviconSource(
        context,
        image,
        96,
        image.naturalWidth,
        image.naturalHeight,
        renderSettings,
      );

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(sourceUrl);
        if (!blob) return;
        const nextIconUrl = URL.createObjectURL(blob);
        setPreviewIconUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }
          return nextIconUrl;
        });
      }, "image/png");
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
    };
  }, [file, renderSettings]);

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

    const icons = (
      await Promise.all(
        FAVICON_SIZES.map(async (size) => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext("2d");
          if (!context) {
            return null;
          }
          drawFaviconSource(
            context,
            image,
            size,
            image.naturalWidth,
            image.naturalHeight,
            renderSettings,
          );

          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/png");
          });
          if (!blob) {
            return null;
          }

          return {
            size,
            url: URL.createObjectURL(blob),
            blob,
            fileName: faviconFileName(size),
          };
        }),
      )
    ).filter((icon): icon is GeneratedIcon => icon !== null);

    setGenerated(icons);
  };

  const onDropFiles = (nextFiles: File[]) => {
    const nextFile = nextFiles.find((candidate) =>
      candidate.type.startsWith("image/"),
    );
    if (!nextFile) {
      return;
    }
    const nextProjectName = normalizeAppName(
      nextFile.name.replace(/\.[^.]+$/, "") || nextFile.name,
    );
    setFile(nextFile);
    setAppName(nextProjectName);
    setShortName(normalizeShortName("", nextProjectName));
  };

  const onDownloadZip = async () => {
    if (generated.length === 0) {
      return;
    }

    const packageFiles = await buildFaviconPackage(generated, {
      appName: projectName,
      shortName: normalizeShortName(shortName, projectName),
      themeColor,
      backgroundColor,
    });
    const zipBlob = await createZipBlob(packageFiles);
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

  const onDownloadBrowserConfig = () => {
    if (!browserConfigContent) {
      return;
    }
    downloadTextFile(
      browserConfigContent,
      "browserconfig.xml",
      "application/xml;charset=utf-8",
    );
  };

  return (
    <ToolSection title={text.title}>
      <ToolDropSurface
        dropHint={text.dropHint}
        label={text.inputLabel}
        onSelectFiles={onDropFiles}
      >
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border bg-background/28 p-4">
            <ToolFileDrop
              accept="image/*"
              currentFileText={
                file ? `${text.currentFile}: ${file.name}` : null
              }
              dropHint={text.dropHint}
              inputAriaLabel={text.inputLabel}
              label={text.inputLabel}
              onSelectFiles={onDropFiles}
            />

            <ToolField label={text.fitLabel}>
              <FaviconFitModeButtons
                onChange={(fit) =>
                  setRenderSettings((current) => ({ ...current, fit }))
                }
                value={renderSettings.fit}
              />
            </ToolField>

            <ToolField label={text.scaleLabel}>
              <ToolSlider
                displayValue={`${Math.round(renderSettings.scale * 100)}%`}
                max={2}
                min={0}
                onChange={(value) =>
                  setRenderSettings((current) => ({
                    ...current,
                    scale: clampFaviconScale(value),
                  }))
                }
                step={0.01}
                value={renderSettings.scale}
              />
            </ToolField>

            <ToolField label={text.roundnessLabel}>
              <ToolSlider
                displayValue={`${Math.round(renderSettings.roundness * 100)}%`}
                max={1}
                min={0}
                onChange={(value) =>
                  setRenderSettings((current) => ({
                    ...current,
                    roundness: clampFaviconRoundness(value),
                  }))
                }
                step={0.01}
                value={renderSettings.roundness}
              />
            </ToolField>

            <ToolToggleField label={text.tintToggleLabel}>
              <ToolSwitch
                aria-label={text.tintToggleLabel}
                checked={renderSettings.tintEnabled}
                onChange={(checked) =>
                  setRenderSettings((current) => ({
                    ...current,
                    tintEnabled: checked,
                  }))
                }
              />
            </ToolToggleField>
            {renderSettings.tintEnabled ? (
              <ToolField label={text.tintColorLabel}>
                <ToolColorPicker
                  onChange={(value) =>
                    setRenderSettings((current) => ({
                      ...current,
                      tintColor: value,
                    }))
                  }
                  value={renderSettings.tintColor}
                />
              </ToolField>
            ) : null}

            <ToolToggleField label={text.backgroundToggleLabel}>
              <ToolSwitch
                aria-label={text.backgroundToggleLabel}
                checked={renderSettings.backgroundEnabled}
                onChange={(checked) =>
                  setRenderSettings((current) => ({
                    ...current,
                    backgroundEnabled: checked,
                  }))
                }
              />
            </ToolToggleField>
            {renderSettings.backgroundEnabled ? (
              <ToolField label={text.backgroundFillLabel}>
                <ToolColorPicker
                  onChange={(value) =>
                    setRenderSettings((current) => ({
                      ...current,
                      backgroundColor: value,
                    }))
                  }
                  value={renderSettings.backgroundColor}
                />
              </ToolField>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <ToolField htmlFor="favicon-app-name" label={text.appNameLabel}>
                <input
                  aria-label={text.appNameLabel}
                  className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm"
                  id="favicon-app-name"
                  onChange={(event) => setAppName(event.target.value)}
                  value={appName}
                />
              </ToolField>
              <ToolField
                htmlFor="favicon-short-name"
                label={text.shortNameLabel}
              >
                <input
                  aria-label={text.shortNameLabel}
                  className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm"
                  id="favicon-short-name"
                  maxLength={24}
                  onChange={(event) => setShortName(event.target.value)}
                  value={shortName}
                />
              </ToolField>
              <ToolField label={text.themeColorLabel}>
                <ToolColorPicker onChange={setThemeColor} value={themeColor} />
              </ToolField>
              <ToolField label={text.backgroundColorLabel}>
                <ToolColorPicker
                  onChange={setBackgroundColor}
                  value={backgroundColor}
                />
              </ToolField>
            </div>
          </div>

          <div className="rounded-[28px] border bg-[#131313] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.14)] dark:border-white/10">
            <div className="rounded-[24px] border border-white/6 bg-[#171717] p-5">
              <div className="flex min-h-[380px] flex-col justify-between gap-6 rounded-[20px] border border-white/5 bg-[#101010] p-6">
                <div className="flex flex-1 items-center justify-center">
                  <div className="flex flex-wrap items-end justify-center gap-4">
                    <div className="relative translate-y-2 scale-[0.82] opacity-85">
                      <FaviconPreviewTab
                        dark
                        iconUrl={file ? previewIconUrl : null}
                        label="Your Website"
                      />
                    </div>
                    <div className="relative z-10 scale-100">
                      <FaviconPreviewTab
                        iconUrl={file ? previewIconUrl : null}
                        label="Your Website"
                      />
                    </div>
                    <div className="relative translate-y-2 scale-[0.82] opacity-70">
                      <FaviconPreviewTab
                        dark
                        iconUrl={file ? previewIconUrl : null}
                        label="Your Website"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-white/6 bg-white/[0.035] p-5 text-center">
                  {file ? (
                    <button
                      className="rounded-full border border-white/10 bg-white/[0.08] px-5 py-2 text-sm text-white/90 transition-colors hover:bg-white/[0.14]"
                      onClick={() => {
                        if (previewIconUrl) {
                          URL.revokeObjectURL(previewIconUrl);
                        }
                        setPreviewIconUrl(null);
                        setFile(null);
                      }}
                      type="button"
                    >
                      {text.replaceImage}
                    </button>
                  ) : (
                    <p className="text-sm text-white/66">{text.previewEmpty}</p>
                  )}
                  <p className="mt-4 text-xs text-white/38">
                    {text.previewFormats}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                generated.forEach((icon) => {
                  URL.revokeObjectURL(icon.url);
                });
                if (previewIconUrl) {
                  URL.revokeObjectURL(previewIconUrl);
                }
                setPreviewIconUrl(null);
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
                  download={icon.fileName}
                  href={icon.url}
                  key={icon.size}
                >
                  <span>
                    {icon.size}x{icon.size}
                  </span>
                  <span>{icon.fileName}</span>
                </a>
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              <div className="space-y-2 rounded-md border bg-background/40 p-3">
                <p className="text-sm">{text.manifest}</p>
                <ToolTextarea
                  className="h-40 bg-background/60 text-xs"
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
                <p className="text-sm">{text.browserConfig}</p>
                <ToolTextarea
                  className="h-40 bg-background/60 text-xs"
                  readOnly
                  value={browserConfigContent}
                />
                <ToolActions
                  actions={[
                    {
                      label: text.copyBrowserConfig,
                      onClick: () => {
                        void copyTextToClipboard(browserConfigContent);
                      },
                      disabled: browserConfigContent.length === 0,
                    },
                    {
                      label: text.downloadBrowserConfig,
                      onClick: onDownloadBrowserConfig,
                      disabled: browserConfigContent.length === 0,
                    },
                  ]}
                />
              </div>
              <div className="space-y-2 rounded-md border bg-background/40 p-3">
                <p className="text-sm">{text.snippet}</p>
                <ToolTextarea
                  className="h-40 bg-background/60 text-xs"
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
      </ToolDropSurface>
    </ToolSection>
  );
}
