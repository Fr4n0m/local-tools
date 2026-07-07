"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import NextImage from "next/image";
import {
  IconBrandGoogle,
  IconBrandApple,
  IconBrandAndroid,
  IconBraces,
  IconClipboardText,
  IconDownload,
  IconDeviceMobile,
  IconPhotoCog,
  IconTrash,
  IconMoonStars,
  IconSearch,
  IconWorld,
} from "@tabler/icons-react";

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
  normalizeFaviconPath,
  normalizeShortName,
  normalizeVersionTag,
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
  ToolInput,
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

async function generateRenderedIcons(
  file: File,
  renderSettings: FaviconRenderSettings,
  variant: "regular" | "dark" = "regular",
): Promise<GeneratedIcon[]> {
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

  return (
    await Promise.all(
      FAVICON_SIZES.map(async (size) => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) return null;

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
        if (!blob) return null;

        return {
          size,
          url: URL.createObjectURL(blob),
          blob,
          fileName: faviconFileName(size, variant),
        };
      }),
    )
  ).filter((icon): icon is GeneratedIcon => icon !== null);
}

async function generatePreviewIconUrl(
  file: File,
  renderSettings: FaviconRenderSettings,
): Promise<string | null> {
  const image = new Image();
  const sourceUrl = URL.createObjectURL(file);
  image.src = sourceUrl;
  return new Promise((resolve) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 96;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(sourceUrl);
        resolve(null);
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
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve(null);
    };
  });
}

const FAVICON_FIT_OPTIONS: FaviconFitMode[] = ["contain", "crop", "stretch"];

function FaviconPreviewTab({
  label,
  iconUrl,
  dark = false,
  active = false,
}: {
  label: string;
  iconUrl: string | null;
  dark?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={`relative flex h-[72px] min-w-[190px] max-w-[230px] items-center gap-3 rounded-t-[18px] rounded-b-[10px] border px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.16)] ${
        dark
          ? "border-white/8 bg-[#26262b] text-white/76"
          : "border-black/10 bg-[#f7f7f8] text-black/72"
      } ${active ? "z-10" : "z-0"}`}
    >
      <div
        className={`absolute inset-x-3 top-0 h-px ${
          dark ? "bg-white/12" : "bg-white/80"
        }`}
      />
      <div
        className={`grid h-7 w-7 place-items-center rounded-md border ${
          dark ? "border-white/12 bg-white/8" : "border-black/10 bg-white"
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
        <div
          className={`truncate text-sm font-medium ${
            dark ? "text-white/72" : "text-black/78"
          }`}
        >
          {label}
        </div>
        <div
          className={`mt-0.5 h-1.5 w-16 rounded-full ${
            dark ? "bg-white/10" : "bg-black/8"
          }`}
        />
      </div>
    </div>
  );
}

function PreviewHeading({
  icon: Icon,
  label,
}: {
  icon: typeof IconWorld;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm font-medium text-white/72">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}

function SearchPreviewCard({
  iconUrl,
  siteLabel,
  resultLabel,
  dark = false,
}: {
  iconUrl: string | null;
  siteLabel: string;
  resultLabel: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] p-4 ${
        dark ? "bg-[#121216] text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl border ${
            dark
              ? "border-white/10 bg-white/[0.04]"
              : "border-black/10 bg-black/[0.03]"
          }`}
        >
          {iconUrl ? (
            <NextImage
              alt=""
              className="rounded-[6px]"
              height={20}
              src={iconUrl}
              unoptimized
              width={20}
            />
          ) : (
            <div
              className={`h-5 w-5 rounded-[6px] ${
                dark ? "bg-white/16" : "bg-black/12"
              }`}
            />
          )}
        </div>
        <div className="min-w-0">
          <div
            className={`truncate text-sm font-medium ${
              dark ? "text-white/82" : "text-black/82"
            }`}
          >
            {siteLabel}
          </div>
          <div
            className={`truncate text-xs ${
              dark ? "text-[#9aa0a6]" : "text-[#5f6368]"
            }`}
          >
            https://example.com
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div
          className={`text-sm font-semibold ${
            dark ? "text-[#9ec1ff]" : "text-[#1a4fd7]"
          }`}
        >
          {resultLabel}
        </div>
        <p
          className={`text-xs leading-5 ${
            dark ? "text-white/58" : "text-black/56"
          }`}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
    </div>
  );
}

function MobilePreviewCard({
  icon: Icon,
  iconUrl,
  appLabel,
  dark = false,
}: {
  icon: typeof IconWorld;
  iconUrl: string | null;
  appLabel: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] p-4 ${
        dark ? "bg-[#111111] text-white" : "bg-white text-black"
      } h-full`}
    >
      <div className="flex h-full items-center justify-center">
        <div
          className={`flex h-[168px] w-[92px] flex-col rounded-[24px] border p-3 ${
            dark
              ? "border-white/10 bg-[#0b0b0d]"
              : "border-black/10 bg-[#f3f4f6]"
          }`}
        >
          <div
            className={`mx-auto h-1.5 w-10 rounded-full ${
              dark ? "bg-white/18" : "bg-black/12"
            }`}
          />
          <div className="flex flex-1 items-center justify-center">
            <div
              className={`grid h-14 w-14 place-items-center rounded-[18px] border ${
                dark
                  ? "border-white/10 bg-[#171717]"
                  : "border-black/10 bg-white"
              }`}
            >
              {iconUrl ? (
                <NextImage
                  alt=""
                  className="rounded-[14px]"
                  height={40}
                  src={iconUrl}
                  unoptimized
                  width={40}
                />
              ) : (
                <div
                  className={`h-10 w-10 rounded-[14px] ${
                    dark ? "bg-white/16" : "bg-black/12"
                  }`}
                />
              )}
            </div>
          </div>
          <div
            className={`rounded-xl px-2 py-1 text-center text-[11px] ${
              dark
                ? "bg-[#181818] text-white/78"
                : "bg-black/[0.04] text-black/54"
            }`}
          >
            {appLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowserPreviewMock({
  lightIconUrl,
  darkIconUrl,
  label,
}: {
  lightIconUrl: string | null;
  darkIconUrl: string | null;
  label: string;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] bg-[#202024]">
      <div className="rounded-[24px] bg-[#2a2a2f] px-4 pb-4 pt-4">
        <div className="flex items-end justify-center gap-3 overflow-x-auto overflow-y-visible rounded-[18px] px-2 pb-2">
          <div className="opacity-72">
            <FaviconPreviewTab dark iconUrl={darkIconUrl} label={label} />
          </div>
          <div className="opacity-100">
            <FaviconPreviewTab active iconUrl={lightIconUrl} label={label} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewSection({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {header}
      </div>
      <div className="rounded-[22px] bg-[#141414] p-4">{children}</div>
    </section>
  );
}

function PreviewSubtleStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

function PreviewSettingsPanel({ children }: { children: ReactNode }) {
  return <div className="rounded-[18px] bg-black/18 p-4">{children}</div>;
}

function PreviewSettingsField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/78">{label}</span>
      {children}
    </label>
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
  const [darkFile, setDarkFile] = useState<File | null>(null);
  const [useDedicatedDarkIcon, setUseDedicatedDarkIcon] = useState(false);
  const [generated, setGenerated] = useState<GeneratedIcon[]>([]);
  const [generatedDark, setGeneratedDark] = useState<GeneratedIcon[]>([]);
  const [appName, setAppName] = useState("LocalTools");
  const [shortName, setShortName] = useState("LT");
  const [themeColor, setThemeColor] = useState("#111111");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [previewIconUrl, setPreviewIconUrl] = useState<string | null>(null);
  const [darkPreviewIconUrl, setDarkPreviewIconUrl] = useState<string | null>(
    null,
  );
  const [appleIconMode, setAppleIconMode] = useState<"light" | "dark">("light");
  const [androidIconMode, setAndroidIconMode] = useState<"light" | "dark">(
    "dark",
  );
  const [applePreviewLabel, setApplePreviewLabel] = useState("MyWebSite");
  const [androidPreviewLabel, setAndroidPreviewLabel] = useState("MySite");
  const [faviconPath, setFaviconPath] = useState("/");
  const [versionTag, setVersionTag] = useState("");
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
      faviconPath,
      version: versionTag,
    });
  }, [
    backgroundColor,
    faviconPath,
    generated,
    projectName,
    shortName,
    themeColor,
    versionTag,
  ]);

  const browserConfigContent = useMemo(() => {
    if (generated.length === 0) {
      return "";
    }

    return buildBrowserConfigContent(generated, {
      appName: projectName,
      shortName: normalizeShortName(shortName, projectName),
      themeColor,
      backgroundColor,
      faviconPath,
      version: versionTag,
    });
  }, [
    backgroundColor,
    faviconPath,
    generated,
    projectName,
    shortName,
    themeColor,
    versionTag,
  ]);

  const htmlSnippet = useMemo(() => {
    if (generated.length === 0) {
      return "";
    }

    return buildHtmlSnippet(
      generated,
      {
        appName: projectName,
        shortName: normalizeShortName(shortName, projectName),
        themeColor,
        backgroundColor,
        faviconPath,
        version: versionTag,
      },
      generatedDark,
    );
  }, [
    backgroundColor,
    faviconPath,
    generated,
    generatedDark,
    projectName,
    shortName,
    themeColor,
    versionTag,
  ]);

  useEffect(() => {
    return () => {
      generated.forEach((icon) => {
        URL.revokeObjectURL(icon.url);
      });
      generatedDark.forEach((icon) => {
        URL.revokeObjectURL(icon.url);
      });
      if (previewIconUrl) {
        URL.revokeObjectURL(previewIconUrl);
      }
      if (darkPreviewIconUrl) {
        URL.revokeObjectURL(darkPreviewIconUrl);
      }
    };
  }, [darkPreviewIconUrl, generated, generatedDark, previewIconUrl]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!file) {
        setPreviewIconUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return null;
        });
        setDarkPreviewIconUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return null;
        });
        return;
      }

      const regularPreview = await generatePreviewIconUrl(file, renderSettings);
      if (!cancelled) {
        setPreviewIconUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return regularPreview;
        });
      }

      const sourceForDark = useDedicatedDarkIcon && darkFile ? darkFile : file;
      const nextDarkPreview = await generatePreviewIconUrl(
        sourceForDark,
        renderSettings,
      );
      if (!cancelled) {
        setDarkPreviewIconUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return nextDarkPreview;
        });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [darkFile, file, renderSettings, useDedicatedDarkIcon]);

  const onGenerate = async () => {
    if (!file) {
      return;
    }

    generated.forEach((icon) => URL.revokeObjectURL(icon.url));
    generatedDark.forEach((icon) => URL.revokeObjectURL(icon.url));

    const icons = await generateRenderedIcons(file, renderSettings);
    const darkSource = useDedicatedDarkIcon && darkFile ? darkFile : file;
    const darkIcons =
      useDedicatedDarkIcon || darkFile
        ? await generateRenderedIcons(darkSource, renderSettings, "dark")
        : [];

    setGenerated(icons);
    setGeneratedDark(darkIcons);
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

  const onDropDarkFiles = (nextFiles: File[]) => {
    const nextFile = nextFiles.find((candidate) =>
      candidate.type.startsWith("image/"),
    );
    if (!nextFile) {
      return;
    }
    setDarkFile(nextFile);
  };

  const onDownloadZip = async () => {
    if (generated.length === 0) {
      return;
    }

    const packageFiles = await buildFaviconPackage(
      generated,
      {
        appName: projectName,
        shortName: normalizeShortName(shortName, projectName),
        themeColor,
        backgroundColor,
        faviconPath,
        version: versionTag,
      },
      generatedDark,
    );
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

            <ToolToggleField label={text.darkIconToggleLabel}>
              <ToolSwitch
                aria-label={text.darkIconToggleLabel}
                checked={useDedicatedDarkIcon}
                onChange={(checked) => {
                  setUseDedicatedDarkIcon(checked);
                  if (!checked) {
                    setDarkFile(null);
                  }
                }}
              />
            </ToolToggleField>

            {useDedicatedDarkIcon ? (
              <ToolFileDrop
                accept="image/*"
                currentFileText={
                  darkFile ? `${text.darkCurrentFile}: ${darkFile.name}` : null
                }
                dropHint={text.darkDropHint}
                inputAriaLabel={text.darkInputLabel}
                label={text.darkInputLabel}
                onSelectFiles={onDropDarkFiles}
              />
            ) : null}

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
              <ToolField htmlFor="favicon-path" label={text.pathLabel}>
                <ToolInput
                  aria-label={text.pathLabel}
                  id="favicon-path"
                  onChange={(event) =>
                    setFaviconPath(normalizeFaviconPath(event.target.value))
                  }
                  placeholder="/"
                  value={faviconPath}
                />
              </ToolField>
              <ToolField htmlFor="favicon-version" label={text.versionLabel}>
                <ToolInput
                  aria-label={text.versionLabel}
                  id="favicon-version"
                  onChange={(event) =>
                    setVersionTag(normalizeVersionTag(event.target.value))
                  }
                  placeholder="2026-07"
                  value={versionTag}
                />
              </ToolField>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#131313] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.14)] dark:border-white/10">
            <div className="flex min-h-[380px] flex-col justify-between gap-8 rounded-[24px] bg-[#171717] p-6">
              <div className="flex flex-1 flex-col gap-6">
                <PreviewSection
                  header={
                    <>
                      <PreviewHeading
                        icon={IconWorld}
                        label={text.browserPreview}
                      />
                      <PreviewHeading
                        icon={useDedicatedDarkIcon ? IconMoonStars : IconSearch}
                        label={
                          useDedicatedDarkIcon
                            ? text.darkIconLabel
                            : text.regularIconLabel
                        }
                      />
                    </>
                  }
                >
                  <BrowserPreviewMock
                    darkIconUrl={file ? darkPreviewIconUrl : null}
                    lightIconUrl={file ? previewIconUrl : null}
                    label={normalizeShortName(shortName, projectName)}
                  />
                </PreviewSection>

                <PreviewSection
                  header={
                    <>
                      <PreviewHeading
                        icon={IconBrandGoogle}
                        label={text.searchPreview}
                      />
                      <PreviewHeading
                        icon={IconMoonStars}
                        label={text.lightDarkPreview}
                      />
                    </>
                  }
                >
                  <PreviewSubtleStack>
                    <SearchPreviewCard
                      iconUrl={file ? previewIconUrl : null}
                      resultLabel={projectName}
                      siteLabel={normalizeShortName(shortName, projectName)}
                    />
                    <SearchPreviewCard
                      dark
                      iconUrl={file ? darkPreviewIconUrl : null}
                      resultLabel={projectName}
                      siteLabel={normalizeShortName(shortName, projectName)}
                    />
                  </PreviewSubtleStack>
                </PreviewSection>

                <PreviewSection
                  header={
                    <PreviewHeading
                      icon={IconBrandApple}
                      label={text.applePreview}
                    />
                  }
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-stretch">
                    <MobilePreviewCard
                      appLabel={applePreviewLabel}
                      icon={IconBrandApple}
                      iconUrl={
                        file
                          ? appleIconMode === "dark"
                            ? darkPreviewIconUrl
                            : previewIconUrl
                          : null
                      }
                      dark={appleIconMode === "dark"}
                    />
                    <PreviewSettingsPanel>
                      <div className="grid h-full content-start gap-3">
                        <PreviewSettingsField label="Icono Apple">
                          <select
                            className="h-11 w-full rounded-md border border-white/12 bg-white/6 px-3 text-sm text-white outline-none"
                            onChange={(event) =>
                              setAppleIconMode(
                                event.target.value as "light" | "dark",
                              )
                            }
                            value={appleIconMode}
                          >
                            <option value="light">Principal</option>
                            <option value="dark">Dark</option>
                          </select>
                        </PreviewSettingsField>
                        <PreviewSettingsField label="Nombre Apple">
                          <ToolInput
                            className="border-white/12 bg-white text-black"
                            id="apple-preview-label"
                            onChange={(event) =>
                              setApplePreviewLabel(
                                event.target.value || "MyWebSite",
                              )
                            }
                            value={applePreviewLabel}
                          />
                        </PreviewSettingsField>
                        <div className="text-xs text-white/46">
                          Preview específica de Apple con icono y nombre
                          independientes.
                        </div>
                      </div>
                    </PreviewSettingsPanel>
                  </div>
                </PreviewSection>

                <PreviewSection
                  header={
                    <PreviewHeading
                      icon={IconBrandAndroid}
                      label={text.androidPreview}
                    />
                  }
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-stretch">
                    <MobilePreviewCard
                      appLabel={androidPreviewLabel}
                      dark={androidIconMode === "dark"}
                      icon={IconBrandAndroid}
                      iconUrl={
                        file
                          ? androidIconMode === "dark"
                            ? darkPreviewIconUrl
                            : previewIconUrl
                          : null
                      }
                    />
                    <PreviewSettingsPanel>
                      <div className="grid h-full content-start gap-3">
                        <PreviewSettingsField label="Icono Android">
                          <select
                            className="h-11 w-full rounded-md border border-white/12 bg-white/6 px-3 text-sm text-white outline-none"
                            onChange={(event) =>
                              setAndroidIconMode(
                                event.target.value as "light" | "dark",
                              )
                            }
                            value={androidIconMode}
                          >
                            <option value="light">Principal</option>
                            <option value="dark">Dark</option>
                          </select>
                        </PreviewSettingsField>
                        <PreviewSettingsField label="Nombre Android">
                          <ToolInput
                            className="border-white/12 bg-white text-black"
                            id="android-preview-label"
                            onChange={(event) =>
                              setAndroidPreviewLabel(
                                event.target.value || "MySite",
                              )
                            }
                            value={androidPreviewLabel}
                          />
                        </PreviewSettingsField>
                        <PreviewSettingsField label="Nombre corto">
                          <ToolInput
                            className="border-white/12 bg-white text-black"
                            id="android-preview-short"
                            onChange={(event) =>
                              setShortName(event.target.value)
                            }
                            value={shortName}
                          />
                        </PreviewSettingsField>
                      </div>
                    </PreviewSettingsPanel>
                  </div>
                </PreviewSection>
              </div>

              <div className="rounded-[20px] border border-white/6 bg-white/[0.035] p-5 text-center">
                {file ? (
                  <button
                    className="rounded-full border border-white/10 bg-white/[0.08] px-5 py-2 text-sm text-white/90 transition-colors hover:bg-white/[0.14]"
                    onClick={() => {
                      if (previewIconUrl) {
                        URL.revokeObjectURL(previewIconUrl);
                      }
                      if (darkPreviewIconUrl) {
                        URL.revokeObjectURL(darkPreviewIconUrl);
                      }
                      setPreviewIconUrl(null);
                      setDarkPreviewIconUrl(null);
                      setFile(null);
                      setDarkFile(null);
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
        <ToolActions
          actions={[
            {
              label: text.generate,
              onClick: () => {
                void onGenerate();
              },
              disabled: !file,
              icon: <IconPhotoCog className="h-4 w-4" />,
            },
            {
              label: sharedText.buttons.download,
              onClick: () => {
                void onDownloadZip();
              },
              disabled: generated.length === 0,
              icon: <IconDownload className="h-4 w-4" />,
            },
            {
              label: sharedText.buttons.clear,
              onClick: () => {
                generated.forEach((icon) => {
                  URL.revokeObjectURL(icon.url);
                });
                generatedDark.forEach((icon) => {
                  URL.revokeObjectURL(icon.url);
                });
                if (previewIconUrl) {
                  URL.revokeObjectURL(previewIconUrl);
                }
                if (darkPreviewIconUrl) {
                  URL.revokeObjectURL(darkPreviewIconUrl);
                }
                setPreviewIconUrl(null);
                setDarkPreviewIconUrl(null);
                setFile(null);
                setDarkFile(null);
                setGenerated([]);
                setGeneratedDark([]);
              },
              disabled:
                !file &&
                !darkFile &&
                generated.length === 0 &&
                generatedDark.length === 0,
              icon: <IconTrash className="h-4 w-4" />,
            },
          ]}
        />
        {generated.length === 0 ? (
          <p className="text-sm">{text.empty}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">{text.result}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...generated, ...generatedDark].map((icon) => (
                <a
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                  download={icon.fileName}
                  href={icon.url}
                  key={icon.fileName}
                >
                  <span className="inline-flex items-center gap-2">
                    {icon.size}x{icon.size}
                    {icon.fileName.includes("-dark") ? (
                      <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
                        dark
                      </span>
                    ) : null}
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
                      icon: <IconClipboardText className="h-4 w-4" />,
                    },
                    {
                      label: text.downloadManifest,
                      onClick: onDownloadManifest,
                      disabled: manifestContent.length === 0,
                      icon: <IconDownload className="h-4 w-4" />,
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
                      icon: <IconClipboardText className="h-4 w-4" />,
                    },
                    {
                      label: text.downloadBrowserConfig,
                      onClick: onDownloadBrowserConfig,
                      disabled: browserConfigContent.length === 0,
                      icon: <IconDownload className="h-4 w-4" />,
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
                      icon: <IconBraces className="h-4 w-4" />,
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
