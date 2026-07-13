"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  IconBrandGoogle,
  IconBrandApple,
  IconBrandAndroid,
  IconBraces,
  IconClipboardText,
  IconDownload,
  IconPhotoCog,
  IconTrash,
  IconMoonStars,
  IconPalette,
  IconSettings,
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
  FAVICON_CORNER_SHAPES,
  FAVICON_SIZES,
  faviconFileName,
  type FaviconFitMode,
  type FaviconCornerShape,
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
import {
  AnimatedLayoutGroup,
  AnimatedLayoutItem,
} from "@/shared/presentation/components/animated-layout";
import { ToolDropSurface } from "@/shared/presentation/components/tool-drop-surface";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import { Button } from "@/shared/presentation/components/ui/button";
import { SegmentedControl } from "@/shared/presentation/components/segmented-control";
import {
  ToolColorPicker,
  ToolField,
  ToolFileDrop,
  ToolInput,
  ToolSection,
  ToolSlider,
  ToolSwitch,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";
import {
  BrowserPreviewMock,
  SearchPreviewCard,
} from "@/shared/presentation/components/browser-search-mocks";
import {
  MobilePreviewCard,
  PreviewHeading,
  PreviewModeCard,
  PreviewSection,
  PreviewSettingsPanel,
  PreviewSubtleStack,
} from "./favicon-generator-previews";

type Props = { language: Language };

const CORNER_SHAPE_PATHS: Record<FaviconCornerShape, string> = {
  square: "M5 5H35V35H5Z",
  round:
    "M15 5H25A10 10 0 0 1 35 15V25A10 10 0 0 1 25 35H15A10 10 0 0 1 5 25V15A10 10 0 0 1 15 5Z",
  squircle:
    "M15 5H25C33.2 5 35 6.8 35 15V25C35 33.2 33.2 35 25 35H15C6.8 35 5 33.2 5 25V15C5 6.8 6.8 5 15 5Z",
  bevel: "M15 5H25L35 15V25L25 35H15L5 25V15Z",
  scoop: "M15 5H25Q25 15 35 15V25Q25 25 25 35H15Q15 25 5 25V15Q15 15 15 5Z",
  notch: "M15 5H25V15H35V25H25V35H15V25H5V15H15Z",
};

function SettingsHeading({ id, label }: { id: string; label: string }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold" id={id}>
      <IconSettings aria-hidden className="h-4 w-4" />
      {label}
    </h3>
  );
}

function CornerShapePicker({
  label,
  labels,
  onChange,
  value,
}: {
  label: string;
  labels: FaviconText["cornerShapeOptions"];
  onChange: (shape: FaviconCornerShape) => void;
  value: FaviconCornerShape;
}) {
  const groupName = useId();

  return (
    <fieldset className="grid grid-cols-3 gap-2">
      <legend className="sr-only">{label}</legend>
      {FAVICON_CORNER_SHAPES.map((shape) => (
        <label className="group relative cursor-pointer" key={shape}>
          <input
            checked={value === shape}
            className="peer sr-only"
            name={groupName}
            onChange={() => onChange(shape)}
            type="radio"
            value={shape}
          />
          <span className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border border-border/85 bg-[var(--tool-control-bg)] px-2 py-2 text-xs font-medium text-foreground/70 shadow-[2px_2px_0_var(--surface-shadow-color)] transition-[background-color,color,box-shadow,transform] group-hover:-translate-y-0.5 group-hover:bg-[var(--tool-control-hover-bg)] peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground dark:border-white/22">
            <svg
              aria-hidden="true"
              className="h-7 w-7 fill-current"
              viewBox="0 0 40 40"
            >
              <path d={CORNER_SHAPE_PATHS[shape]} />
            </svg>
            <span>{labels[shape]}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function StyleOverrideButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button aria-pressed={active} onClick={onClick} size="sm" type="button">
      <IconPalette aria-hidden className="h-4 w-4" />
      {label}
    </Button>
  );
}

type GeneratedIcon = GeneratedFaviconPackageAsset & {
  url: string;
};

type FaviconRenderTarget = "browser" | "apple" | "android";
type FaviconRenderSettingsByTarget = Record<
  FaviconRenderTarget,
  FaviconRenderSettings
>;
type FaviconPreviewUrlsByTarget = Record<FaviconRenderTarget, string | null>;
type GlobalIconStyle = Pick<
  FaviconRenderSettings,
  "backgroundColor" | "backgroundEnabled" | "tintColor" | "tintEnabled"
>;
type TargetStyleOverrides = Record<FaviconRenderTarget, boolean>;

const DEFAULT_PWA_BACKGROUND_COLOR = "#ffffff";
const DEFAULT_PWA_THEME_COLOR = "#111111";

const FAVICON_RENDER_TARGETS: FaviconRenderTarget[] = [
  "browser",
  "apple",
  "android",
];

function createDefaultFaviconRenderSettingsByTarget(): FaviconRenderSettingsByTarget {
  const browser = createDefaultFaviconRenderSettings();
  const apple = createDefaultFaviconRenderSettings();
  const android = createDefaultFaviconRenderSettings();

  return {
    browser: { ...browser, cornerShape: "round", roundness: 0.33 },
    apple: { ...apple, cornerShape: "squircle", roundness: 0.33 },
    android: { ...android, cornerShape: "squircle", roundness: 0.33 },
  };
}

function createEmptyPreviewUrls(): FaviconPreviewUrlsByTarget {
  return {
    browser: null,
    apple: null,
    android: null,
  };
}

function revokePreviewUrls(urls: FaviconPreviewUrlsByTarget) {
  Object.values(urls).forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
}

function faviconRenderTargetForSize(size: number): FaviconRenderTarget {
  if (size === 180) return "apple";
  if (size === 192 || size === 512) return "android";
  return "browser";
}

async function generateRenderedIcons(
  file: File,
  renderSettingsByTarget: FaviconRenderSettingsByTarget,
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
          renderSettingsByTarget[faviconRenderTargetForSize(size)],
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

type FaviconText = typeof en;

function RenderSettingsFields({
  compact = false,
  settings,
  showColorControls = true,
  text,
  updateSettings,
}: {
  compact?: boolean;
  settings: FaviconRenderSettings;
  showColorControls?: boolean;
  text: FaviconText;
  updateSettings: (
    update: (current: FaviconRenderSettings) => FaviconRenderSettings,
  ) => void;
}) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 content-start gap-3 [&>*:first-child]:col-span-2 [&>*:nth-child(2)]:col-span-2"
          : "grid content-start gap-3"
      }
    >
      <ToolField label={text.fitLabel}>
        <SegmentedControl
          aria-label={text.fitLabel}
          onChange={(fit) =>
            updateSettings((current) => ({
              ...current,
              fit: fit as FaviconFitMode,
            }))
          }
          options={FAVICON_FIT_OPTIONS.map((option) => ({
            value: option,
            label: option[0].toUpperCase() + option.slice(1),
          }))}
          value={settings.fit}
        />
      </ToolField>

      <ToolField label={text.scaleLabel}>
        <ToolSlider
          displayValue={`${Math.round(settings.scale * 100)}%`}
          max={2}
          min={0}
          onChange={(value) =>
            updateSettings((current) => ({
              ...current,
              scale: clampFaviconScale(value),
            }))
          }
          step={0.01}
          value={settings.scale}
        />
      </ToolField>

      {showColorControls ? (
        <>
          <div className="flex items-center gap-2 rounded-xl border border-border/85 bg-[var(--tool-control-bg)] px-3 py-2 shadow-[2px_2px_0_var(--surface-shadow-color)] dark:border-white/22">
            <ToolSwitch
              aria-label={text.tintToggleLabel}
              checked={settings.tintEnabled}
              onChange={(checked) =>
                updateSettings((current) => ({
                  ...current,
                  tintEnabled: checked,
                }))
              }
            />
            <span className="min-w-0 flex-1 text-xs font-medium text-foreground/75">
              {text.tintToggleLabel}
            </span>
            <ToolColorPicker
              className="w-24 shrink-0"
              compact
              disabled={!settings.tintEnabled}
              onChange={(value) =>
                updateSettings((current) => ({
                  ...current,
                  tintColor: value,
                }))
              }
              value={settings.tintColor}
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border/85 bg-[var(--tool-control-bg)] px-3 py-2 shadow-[2px_2px_0_var(--surface-shadow-color)] dark:border-white/22">
            <ToolSwitch
              aria-label={text.backgroundToggleLabel}
              checked={settings.backgroundEnabled}
              onChange={(checked) =>
                updateSettings((current) => ({
                  ...current,
                  backgroundEnabled: checked,
                }))
              }
            />
            <span className="min-w-0 flex-1 text-xs font-medium text-foreground/75">
              {text.backgroundToggleLabel}
            </span>
            <ToolColorPicker
              className="w-24 shrink-0"
              compact
              disabled={!settings.backgroundEnabled}
              onChange={(value) =>
                updateSettings((current) => ({
                  ...current,
                  backgroundColor: value,
                }))
              }
              value={settings.backgroundColor}
            />
          </div>
        </>
      ) : null}

      <ToolField label={text.cornerShapeLabel}>
        <CornerShapePicker
          label={text.cornerShapeLabel}
          labels={text.cornerShapeOptions}
          onChange={(cornerShape) =>
            updateSettings((current) => ({
              ...current,
              cornerShape,
            }))
          }
          value={settings.cornerShape}
        />
      </ToolField>

      <ToolField label={text.roundnessLabel}>
        <ToolSlider
          disabled={settings.cornerShape === "square"}
          displayValue={`${Math.round(settings.roundness * 100)}%`}
          max={1}
          min={0}
          onChange={(value) =>
            updateSettings((current) => ({
              ...current,
              roundness: clampFaviconRoundness(value),
            }))
          }
          step={0.01}
          value={settings.roundness}
        />
        <p className="text-xs text-foreground/55">
          {settings.cornerShape === "square"
            ? text.roundnessSquareHelp
            : settings.backgroundEnabled
              ? text.roundnessWithBackgroundHelp
              : text.roundnessWithoutBackgroundHelp}
        </p>
      </ToolField>
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
  const [globalIconStyle, setGlobalIconStyle] = useState<GlobalIconStyle>({
    backgroundColor: DEFAULT_PWA_BACKGROUND_COLOR,
    backgroundEnabled: false,
    tintColor: DEFAULT_PWA_THEME_COLOR,
    tintEnabled: false,
  });
  const themeColor = globalIconStyle.backgroundEnabled
    ? globalIconStyle.backgroundColor
    : globalIconStyle.tintEnabled
      ? globalIconStyle.tintColor
      : DEFAULT_PWA_THEME_COLOR;
  const backgroundColor = globalIconStyle.backgroundEnabled
    ? globalIconStyle.backgroundColor
    : DEFAULT_PWA_BACKGROUND_COLOR;
  const [previewIconUrls, setPreviewIconUrls] =
    useState<FaviconPreviewUrlsByTarget>(() => createEmptyPreviewUrls());
  const [darkPreviewIconUrls, setDarkPreviewIconUrls] =
    useState<FaviconPreviewUrlsByTarget>(() => createEmptyPreviewUrls());
  const [faviconPath, setFaviconPath] = useState("/");
  const [versionTag, setVersionTag] = useState("");
  const [renderSettingsByTarget, setRenderSettingsByTarget] =
    useState<FaviconRenderSettingsByTarget>(() =>
      createDefaultFaviconRenderSettingsByTarget(),
    );
  const [targetStyleOverrides, setTargetStyleOverrides] =
    useState<TargetStyleOverrides>({
      android: false,
      apple: false,
      browser: false,
    });
  const updateGlobalIconStyle = (update: Partial<GlobalIconStyle>) => {
    const nextStyle = { ...globalIconStyle, ...update };
    setGlobalIconStyle(nextStyle);
    setRenderSettingsByTarget((current) =>
      FAVICON_RENDER_TARGETS.reduce(
        (next, target) => ({
          ...next,
          [target]: targetStyleOverrides[target]
            ? current[target]
            : { ...current[target], ...nextStyle },
        }),
        current,
      ),
    );
  };
  const toggleTargetStyleOverride = (target: FaviconRenderTarget) => {
    const willOverride = !targetStyleOverrides[target];
    setTargetStyleOverrides((current) => ({
      ...current,
      [target]: willOverride,
    }));
    if (!willOverride) {
      setRenderSettingsByTarget((current) => ({
        ...current,
        [target]: { ...current[target], ...globalIconStyle },
      }));
    }
  };
  const updateRenderSettings = (
    target: FaviconRenderTarget,
    update: (current: FaviconRenderSettings) => FaviconRenderSettings,
  ) => {
    setRenderSettingsByTarget((current) => ({
      ...current,
      [target]: update(current[target]),
    }));
  };

  const projectName = useMemo(() => normalizeAppName(appName), [appName]);

  const manifestContent = useMemo(() => {
    if (generated.length === 0) {
      return "";
    }

    return buildManifestContent(
      generated,
      {
        appName: projectName,
        shortName: normalizeShortName(shortName, projectName),
        themeColor,
        backgroundColor,
        faviconPath,
        version: versionTag,
        androidIconVariant: "regular",
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
        appleTouchIconVariant: "regular",
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
      revokePreviewUrls(previewIconUrls);
      revokePreviewUrls(darkPreviewIconUrls);
    };
  }, [darkPreviewIconUrls, generated, generatedDark, previewIconUrls]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!file) {
        setPreviewIconUrls((current) => {
          revokePreviewUrls(current);
          return createEmptyPreviewUrls();
        });
        setDarkPreviewIconUrls((current) => {
          revokePreviewUrls(current);
          return createEmptyPreviewUrls();
        });
        return;
      }

      const regularPreviewEntries = await Promise.all(
        FAVICON_RENDER_TARGETS.map(async (target) => [
          target,
          await generatePreviewIconUrl(file, renderSettingsByTarget[target]),
        ]),
      );
      if (!cancelled) {
        setPreviewIconUrls((current) => {
          revokePreviewUrls(current);
          return Object.fromEntries(
            regularPreviewEntries,
          ) as FaviconPreviewUrlsByTarget;
        });
      }

      const sourceForDark = useDedicatedDarkIcon && darkFile ? darkFile : file;
      const darkPreviewEntries = await Promise.all(
        FAVICON_RENDER_TARGETS.map(async (target) => [
          target,
          await generatePreviewIconUrl(
            sourceForDark,
            renderSettingsByTarget[target],
          ),
        ]),
      );
      if (!cancelled) {
        setDarkPreviewIconUrls((current) => {
          revokePreviewUrls(current);
          return Object.fromEntries(
            darkPreviewEntries,
          ) as FaviconPreviewUrlsByTarget;
        });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [darkFile, file, renderSettingsByTarget, useDedicatedDarkIcon]);

  const onGenerate = async () => {
    if (!file) {
      return;
    }

    generated.forEach((icon) => URL.revokeObjectURL(icon.url));
    generatedDark.forEach((icon) => URL.revokeObjectURL(icon.url));

    const icons = await generateRenderedIcons(file, renderSettingsByTarget);
    const darkSource = useDedicatedDarkIcon && darkFile ? darkFile : file;
    const darkIcons =
      useDedicatedDarkIcon || darkFile
        ? await generateRenderedIcons(
            darkSource,
            renderSettingsByTarget,
            "dark",
          )
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
        appleTouchIconVariant: "regular",
        androidIconVariant: "regular",
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
        <div className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(320px,1.1fr)_minmax(0,2fr)] xl:items-start">
            <div className="grid gap-4">
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

              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border/85 bg-[var(--tool-control-bg)] px-3 py-1.5 shadow-[2px_2px_0_var(--surface-shadow-color)] dark:border-white/22">
                <ToolSwitch
                  aria-label={text.darkIconToggleLabel}
                  checked={useDedicatedDarkIcon}
                  onChange={setUseDedicatedDarkIcon}
                />
                <span className="min-w-0 flex-1 text-xs font-medium text-foreground/75">
                  {text.darkIconToggleLabel}
                </span>

                {useDedicatedDarkIcon ? (
                  <ToolFileDrop
                    accept="image/*"
                    compact
                    currentFileText={
                      darkFile
                        ? `${text.darkCurrentFile}: ${darkFile.name}`
                        : null
                    }
                    dropHint={text.darkDropHint}
                    inputAriaLabel={text.darkInputLabel}
                    label={text.darkInputLabel}
                    onSelectFiles={onDropDarkFiles}
                  />
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ToolField
                className="space-y-1 [&>label]:relative [&>label]:top-0.5"
                htmlFor="favicon-app-name"
                label={text.appNameLabel}
              >
                <ToolInput
                  aria-label={text.appNameLabel}
                  id="favicon-app-name"
                  onChange={(event) => setAppName(event.target.value)}
                  value={appName}
                />
              </ToolField>
              <ToolField
                className="space-y-1 [&>label]:relative [&>label]:top-0.5"
                htmlFor="favicon-short-name"
                label={text.shortNameLabel}
              >
                <ToolInput
                  aria-label={text.shortNameLabel}
                  id="favicon-short-name"
                  maxLength={24}
                  onChange={(event) => setShortName(event.target.value)}
                  value={shortName}
                />
              </ToolField>
              <ToolField
                className="space-y-1 [&>label]:relative [&>label]:top-0.5"
                htmlFor="favicon-path"
                label={text.pathLabel}
              >
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
              <ToolField
                className="space-y-1 [&>label]:relative [&>label]:top-0.5"
                htmlFor="favicon-version"
                label={text.versionLabel}
              >
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
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 md:col-span-2 xl:col-span-2">
                <p className="relative top-1 col-span-2 text-sm font-medium text-foreground/85">
                  {text.globalIconStyleLabel}
                </p>
                <div className="flex h-[38px] min-w-0 items-center gap-2 rounded-lg border border-border/85 bg-[var(--tool-control-bg)] px-3 shadow-[4px_4px_0_var(--surface-shadow-color)] dark:border-white/22">
                  <ToolSwitch
                    aria-label={text.tintToggleLabel}
                    checked={globalIconStyle.tintEnabled}
                    onChange={(tintEnabled) =>
                      updateGlobalIconStyle({ tintEnabled })
                    }
                  />
                  <span className="text-xs font-medium text-foreground/75">
                    {text.globalTintLabel}
                  </span>
                  <ToolColorPicker
                    className="w-24"
                    compact
                    disabled={!globalIconStyle.tintEnabled}
                    onChange={(tintColor) =>
                      updateGlobalIconStyle({ tintColor })
                    }
                    value={globalIconStyle.tintColor}
                  />
                </div>
                <div className="flex h-[38px] min-w-0 items-center gap-2 rounded-lg border border-border/85 bg-[var(--tool-control-bg)] px-3 shadow-[4px_4px_0_var(--surface-shadow-color)] dark:border-white/22">
                  <ToolSwitch
                    aria-label={text.backgroundToggleLabel}
                    checked={globalIconStyle.backgroundEnabled}
                    onChange={(backgroundEnabled) =>
                      updateGlobalIconStyle({ backgroundEnabled })
                    }
                  />
                  <span className="text-xs font-medium text-foreground/75">
                    {text.globalBackgroundLabel}
                  </span>
                  <ToolColorPicker
                    className="w-24"
                    compact
                    disabled={!globalIconStyle.backgroundEnabled}
                    onChange={(backgroundColor) =>
                      updateGlobalIconStyle({ backgroundColor })
                    }
                    value={globalIconStyle.backgroundColor}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-0 text-foreground">
            <div className="flex min-h-[380px] flex-col justify-between gap-8">
              <div className="flex flex-1 flex-col gap-6">
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <PreviewHeading
                      icon={IconWorld}
                      label={text.browserPreview}
                    />
                    {useDedicatedDarkIcon ? (
                      <PreviewHeading
                        icon={IconMoonStars}
                        label={text.darkIconLabel}
                        subtle
                      />
                    ) : null}
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[minmax(300px,1fr)_minmax(380px,0.85fr)] lg:items-start">
                    <div className="grid gap-3">
                      <PreviewModeCard label={text.lightPreviewLabel}>
                        <BrowserPreviewMock
                          darkIconUrl={
                            file ? darkPreviewIconUrls.browser : null
                          }
                          label={normalizeShortName(shortName, projectName)}
                          lightIconUrl={file ? previewIconUrls.browser : null}
                          theme="light"
                        />
                      </PreviewModeCard>
                      <PreviewModeCard dark label={text.darkPreviewLabel}>
                        <BrowserPreviewMock
                          darkIconUrl={
                            file ? darkPreviewIconUrls.browser : null
                          }
                          label={normalizeShortName(shortName, projectName)}
                          lightIconUrl={file ? previewIconUrls.browser : null}
                          theme="dark"
                        />
                      </PreviewModeCard>
                    </div>
                    <PreviewSettingsPanel>
                      <section aria-labelledby="browser-icon-settings">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <SettingsHeading
                            id="browser-icon-settings"
                            label={text.previewSettingsLabel}
                          />
                          <StyleOverrideButton
                            active={targetStyleOverrides.browser}
                            label={
                              targetStyleOverrides.browser
                                ? text.useGlobalStyleLabel
                                : text.customizeStyleLabel
                            }
                            onClick={() => toggleTargetStyleOverride("browser")}
                          />
                        </div>
                        <RenderSettingsFields
                          compact
                          settings={renderSettingsByTarget.browser}
                          showColorControls={targetStyleOverrides.browser}
                          text={text}
                          updateSettings={(update) =>
                            updateRenderSettings("browser", update)
                          }
                        />
                      </section>
                    </PreviewSettingsPanel>
                  </div>
                </section>

                <PreviewSection
                  header={
                    <PreviewHeading
                      icon={IconBrandGoogle}
                      label={text.searchPreview}
                    />
                  }
                >
                  <PreviewSubtleStack>
                    <SearchPreviewCard
                      iconUrl={file ? previewIconUrls.browser : null}
                      resultLabel={projectName}
                      siteLabel={normalizeShortName(shortName, projectName)}
                    />
                    <SearchPreviewCard
                      iconUrl={file ? darkPreviewIconUrls.browser : null}
                      resultLabel={projectName}
                      siteLabel={normalizeShortName(shortName, projectName)}
                      theme="dark"
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
                  <div className="grid gap-4 lg:grid-cols-[minmax(300px,1fr)_280px] lg:items-start">
                    <div className="grid grid-cols-2 gap-3">
                      <MobilePreviewCard
                        appLabel={projectName}
                        iconUrl={file ? previewIconUrls.apple : null}
                        language={language}
                        modeLabel={text.lightPreviewLabel}
                        platform="ios"
                      />
                      <MobilePreviewCard
                        appLabel={projectName}
                        dark
                        iconUrl={file ? darkPreviewIconUrls.apple : null}
                        language={language}
                        modeLabel={text.darkPreviewLabel}
                        platform="ios"
                      />
                    </div>
                    <PreviewSettingsPanel>
                      <section
                        aria-labelledby="apple-icon-settings"
                        className="grid h-full content-start gap-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <SettingsHeading
                            id="apple-icon-settings"
                            label={text.previewSettingsLabel}
                          />
                          <StyleOverrideButton
                            active={targetStyleOverrides.apple}
                            label={
                              targetStyleOverrides.apple
                                ? text.useGlobalStyleLabel
                                : text.customizeStyleLabel
                            }
                            onClick={() => toggleTargetStyleOverride("apple")}
                          />
                        </div>
                        <RenderSettingsFields
                          settings={renderSettingsByTarget.apple}
                          showColorControls={targetStyleOverrides.apple}
                          text={text}
                          updateSettings={(update) =>
                            updateRenderSettings("apple", update)
                          }
                        />
                      </section>
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
                  <div className="grid gap-4 lg:grid-cols-[minmax(300px,1fr)_280px] lg:items-start">
                    <div className="grid grid-cols-2 gap-3">
                      <MobilePreviewCard
                        appLabel={projectName}
                        iconUrl={file ? previewIconUrls.android : null}
                        language={language}
                        modeLabel={text.lightPreviewLabel}
                        platform="android"
                      />
                      <MobilePreviewCard
                        appLabel={projectName}
                        dark
                        iconUrl={file ? darkPreviewIconUrls.android : null}
                        language={language}
                        modeLabel={text.darkPreviewLabel}
                        platform="android"
                      />
                    </div>
                    <PreviewSettingsPanel>
                      <section
                        aria-labelledby="android-icon-settings"
                        className="grid h-full content-start gap-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <SettingsHeading
                            id="android-icon-settings"
                            label={text.previewSettingsLabel}
                          />
                          <StyleOverrideButton
                            active={targetStyleOverrides.android}
                            label={
                              targetStyleOverrides.android
                                ? text.useGlobalStyleLabel
                                : text.customizeStyleLabel
                            }
                            onClick={() => toggleTargetStyleOverride("android")}
                          />
                        </div>
                        <RenderSettingsFields
                          settings={renderSettingsByTarget.android}
                          showColorControls={targetStyleOverrides.android}
                          text={text}
                          updateSettings={(update) =>
                            updateRenderSettings("android", update)
                          }
                        />
                      </section>
                    </PreviewSettingsPanel>
                  </div>
                </PreviewSection>
              </div>

              <div className="flex min-h-14 flex-col items-center justify-center gap-3 rounded-2xl bg-secondary/55 px-4 py-3 sm:flex-row sm:justify-between dark:bg-[#151515]">
                {file ? (
                  <Button
                    className="shrink-0"
                    onClick={() => {
                      revokePreviewUrls(previewIconUrls);
                      revokePreviewUrls(darkPreviewIconUrls);
                      setPreviewIconUrls(createEmptyPreviewUrls());
                      setDarkPreviewIconUrls(createEmptyPreviewUrls());
                      setFile(null);
                      setDarkFile(null);
                    }}
                    size="sm"
                  >
                    <IconPhotoCog className="h-4 w-4" />
                    <span>{text.replaceImage}</span>
                  </Button>
                ) : (
                  <p className="text-sm font-medium text-foreground/72">
                    {text.previewEmpty}
                  </p>
                )}
                <p className="text-center text-xs leading-5 text-foreground/48 sm:text-right">
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
                revokePreviewUrls(previewIconUrls);
                revokePreviewUrls(darkPreviewIconUrls);
                setPreviewIconUrls(createEmptyPreviewUrls());
                setDarkPreviewIconUrls(createEmptyPreviewUrls());
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
            <AnimatedLayoutGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...generated, ...generatedDark].map((icon) => (
                <AnimatedLayoutItem className="h-full" key={icon.fileName}>
                  <a
                    className="flex h-full items-center justify-between rounded-lg border border-border/70 bg-background/45 p-3 text-sm shadow-[4px_4px_0_var(--surface-shadow-color)] transition-[transform,box-shadow,border-color,background-color] hover:-translate-y-0.5 hover:bg-background/65 hover:shadow-[5px_5px_0_var(--surface-shadow-color)] dark:border-white/18 dark:bg-white/[0.025]"
                    download={icon.fileName}
                    href={icon.url}
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
                </AnimatedLayoutItem>
              ))}
            </AnimatedLayoutGroup>
            <div className="grid gap-4 xl:grid-cols-3">
              <div className="space-y-2 rounded-md border bg-background/40 p-3">
                <p className="text-sm">{text.manifest}</p>
                <ToolTextarea
                  className="h-40 text-xs"
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
                  className="h-40 text-xs"
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
                  className="h-40 text-xs"
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
