"use client";

import { useEffect, useMemo, useState } from "react";
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
import { SegmentedControl } from "@/shared/presentation/components/segmented-control";
import {
  ToolColorPicker,
  ToolField,
  ToolFileDrop,
  ToolInput,
  ToolSelect,
  ToolSection,
  ToolSlider,
  ToolSwitch,
  ToolToggleField,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import { sharedMessages } from "@/shared/presentation/i18n";
import {
  BrowserPreviewMock,
  MobilePreviewCard,
  PreviewHeading,
  PreviewSection,
  PreviewSettingsField,
  PreviewSettingsPanel,
  PreviewSubtleStack,
  SearchPreviewCard,
  previewDarkFieldClass,
  previewDarkSelectClass,
} from "./favicon-generator-previews";

type Props = { language: Language };

type GeneratedIcon = GeneratedFaviconPackageAsset & {
  url: string;
};

type FaviconRenderTarget = "browser" | "apple" | "android";
type FaviconRenderSettingsByTarget = Record<
  FaviconRenderTarget,
  FaviconRenderSettings
>;
type FaviconPreviewUrlsByTarget = Record<FaviconRenderTarget, string | null>;

const FAVICON_RENDER_TARGETS: FaviconRenderTarget[] = [
  "browser",
  "apple",
  "android",
];

function createDefaultFaviconRenderSettingsByTarget(): FaviconRenderSettingsByTarget {
  return {
    browser: createDefaultFaviconRenderSettings(),
    apple: createDefaultFaviconRenderSettings(),
    android: createDefaultFaviconRenderSettings(),
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
  const [previewIconUrls, setPreviewIconUrls] =
    useState<FaviconPreviewUrlsByTarget>(() => createEmptyPreviewUrls());
  const [darkPreviewIconUrls, setDarkPreviewIconUrls] =
    useState<FaviconPreviewUrlsByTarget>(() => createEmptyPreviewUrls());
  const [appleIconMode, setAppleIconMode] = useState<"light" | "dark">("light");
  const [androidIconMode, setAndroidIconMode] = useState<"light" | "dark">(
    "dark",
  );
  const [applePreviewLabel, setApplePreviewLabel] = useState("MyWebSite");
  const [androidPreviewLabel, setAndroidPreviewLabel] = useState("MySite");
  const [androidShortName, setAndroidShortName] = useState("LT");
  const [faviconPath, setFaviconPath] = useState("/");
  const [versionTag, setVersionTag] = useState("");
  const [activeRenderTarget, setActiveRenderTarget] =
    useState<FaviconRenderTarget>("browser");
  const [renderSettingsByTarget, setRenderSettingsByTarget] =
    useState<FaviconRenderSettingsByTarget>(() =>
      createDefaultFaviconRenderSettingsByTarget(),
    );
  const activeRenderSettings = renderSettingsByTarget[activeRenderTarget];

  const updateActiveRenderSettings = (
    update: (current: FaviconRenderSettings) => FaviconRenderSettings,
  ) => {
    setRenderSettingsByTarget((current) => ({
      ...current,
      [activeRenderTarget]: update(current[activeRenderTarget]),
    }));
  };

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

    return buildManifestContent(
      generated,
      {
        appName: projectName,
        shortName: normalizeShortName(shortName, projectName),
        themeColor,
        backgroundColor,
        faviconPath,
        version: versionTag,
        androidIconVariant: androidIconMode === "dark" ? "dark" : "regular",
        androidAppName: androidPreviewLabel,
        androidShortName,
      },
      generatedDark,
    );
  }, [
    androidIconMode,
    androidPreviewLabel,
    androidShortName,
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
        appleTouchIconVariant: appleIconMode === "dark" ? "dark" : "regular",
      },
      generatedDark,
    );
  }, [
    appleIconMode,
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
        appleTouchIconVariant: appleIconMode === "dark" ? "dark" : "regular",
        androidIconVariant: androidIconMode === "dark" ? "dark" : "regular",
        androidAppName: androidPreviewLabel,
        androidShortName,
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
        <div className="grid gap-6 xl:grid-cols-[minmax(300px,420px)_minmax(520px,1fr)]">
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

            <ToolField label={text.renderTargetLabel}>
              <SegmentedControl
                aria-label={text.renderTargetLabel}
                onChange={(target) =>
                  setActiveRenderTarget(target as FaviconRenderTarget)
                }
                options={[
                  { value: "browser", label: text.browserTargetLabel },
                  { value: "apple", label: text.appleTargetLabel },
                  { value: "android", label: text.androidTargetLabel },
                ]}
                value={activeRenderTarget}
              />
            </ToolField>

            <ToolField label={text.fitLabel}>
              <SegmentedControl
                aria-label={text.fitLabel}
                onChange={(fit) =>
                  updateActiveRenderSettings((current) => ({
                    ...current,
                    fit,
                  }))
                }
                options={FAVICON_FIT_OPTIONS.map((option) => ({
                  value: option,
                  label: option[0].toUpperCase() + option.slice(1),
                }))}
                value={activeRenderSettings.fit}
              />
            </ToolField>

            <ToolField label={text.scaleLabel}>
              <ToolSlider
                displayValue={`${Math.round(activeRenderSettings.scale * 100)}%`}
                max={2}
                min={0}
                onChange={(value) =>
                  updateActiveRenderSettings((current) => ({
                    ...current,
                    scale: clampFaviconScale(value),
                  }))
                }
                step={0.01}
                value={activeRenderSettings.scale}
              />
            </ToolField>

            <ToolToggleField label={text.tintToggleLabel}>
              <ToolSwitch
                aria-label={text.tintToggleLabel}
                checked={activeRenderSettings.tintEnabled}
                onChange={(checked) =>
                  updateActiveRenderSettings((current) => ({
                    ...current,
                    tintEnabled: checked,
                  }))
                }
              />
            </ToolToggleField>
            {activeRenderSettings.tintEnabled ? (
              <ToolField label={text.tintColorLabel}>
                <ToolColorPicker
                  onChange={(value) =>
                    updateActiveRenderSettings((current) => ({
                      ...current,
                      tintColor: value,
                    }))
                  }
                  value={activeRenderSettings.tintColor}
                />
              </ToolField>
            ) : null}

            <ToolToggleField label={text.backgroundToggleLabel}>
              <ToolSwitch
                aria-label={text.backgroundToggleLabel}
                checked={activeRenderSettings.backgroundEnabled}
                onChange={(checked) =>
                  updateActiveRenderSettings((current) => ({
                    ...current,
                    backgroundEnabled: checked,
                  }))
                }
              />
            </ToolToggleField>
            {activeRenderSettings.backgroundEnabled ? (
              <ToolField label={text.backgroundFillLabel}>
                <ToolColorPicker
                  onChange={(value) =>
                    updateActiveRenderSettings((current) => ({
                      ...current,
                      backgroundColor: value,
                    }))
                  }
                  value={activeRenderSettings.backgroundColor}
                />
              </ToolField>
            ) : null}

            <ToolField label={text.roundnessLabel}>
              <ToolSlider
                displayValue={`${Math.round(activeRenderSettings.roundness * 100)}%`}
                max={1}
                min={0}
                onChange={(value) =>
                  updateActiveRenderSettings((current) => ({
                    ...current,
                    roundness: clampFaviconRoundness(value),
                  }))
                }
                step={0.01}
                value={activeRenderSettings.roundness}
              />
              <p className="text-xs text-foreground/55">
                {activeRenderSettings.backgroundEnabled
                  ? text.roundnessWithBackgroundHelp
                  : text.roundnessWithoutBackgroundHelp}
              </p>
            </ToolField>

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

          <div className="bg-sidebar p-0 text-sidebar-foreground">
            <div className="flex min-h-[380px] flex-col justify-between gap-8">
              <div className="flex flex-1 flex-col gap-6">
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
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
                  </div>
                  <BrowserPreviewMock
                    darkIconUrl={file ? darkPreviewIconUrls.browser : null}
                    lightIconUrl={file ? previewIconUrls.browser : null}
                    label={normalizeShortName(shortName, projectName)}
                  />
                </section>

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
                      iconUrl={file ? previewIconUrls.browser : null}
                      resultLabel={projectName}
                      siteLabel={normalizeShortName(shortName, projectName)}
                    />
                    <SearchPreviewCard
                      dark
                      iconUrl={file ? darkPreviewIconUrls.browser : null}
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
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-stretch">
                    <MobilePreviewCard
                      appLabel={applePreviewLabel}
                      iconUrl={
                        file
                          ? appleIconMode === "dark"
                            ? darkPreviewIconUrls.apple
                            : previewIconUrls.apple
                          : null
                      }
                      dark={appleIconMode === "dark"}
                      platform="ios"
                    />
                    <PreviewSettingsPanel>
                      <div className="grid h-full content-start gap-3">
                        <PreviewSettingsField label="Icono Apple">
                          <ToolSelect
                            onChange={(event) =>
                              setAppleIconMode(event as "light" | "dark")
                            }
                            options={[
                              { value: "light", label: "Principal" },
                              { value: "dark", label: "Dark" },
                            ]}
                            value={appleIconMode}
                            className={previewDarkSelectClass}
                          />
                        </PreviewSettingsField>
                        <PreviewSettingsField label="Nombre Apple">
                          <ToolInput
                            className={previewDarkFieldClass}
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
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-stretch">
                    <MobilePreviewCard
                      appLabel={androidPreviewLabel}
                      dark={androidIconMode === "dark"}
                      iconUrl={
                        file
                          ? androidIconMode === "dark"
                            ? darkPreviewIconUrls.android
                            : previewIconUrls.android
                          : null
                      }
                      platform="android"
                    />
                    <PreviewSettingsPanel>
                      <div className="grid h-full content-start gap-3">
                        <PreviewSettingsField label="Icono Android">
                          <ToolSelect
                            onChange={(event) =>
                              setAndroidIconMode(event as "light" | "dark")
                            }
                            options={[
                              { value: "light", label: "Principal" },
                              { value: "dark", label: "Dark" },
                            ]}
                            value={androidIconMode}
                            className={previewDarkSelectClass}
                          />
                        </PreviewSettingsField>
                        <PreviewSettingsField label="Nombre Android">
                          <ToolInput
                            className={previewDarkFieldClass}
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
                            className={previewDarkFieldClass}
                            id="android-preview-short"
                            onChange={(event) =>
                              setAndroidShortName(event.target.value || "LT")
                            }
                            value={androidShortName}
                          />
                        </PreviewSettingsField>
                      </div>
                    </PreviewSettingsPanel>
                  </div>
                </PreviewSection>
              </div>

              <div className="border-t border-white/10 pt-5 text-center">
                {file ? (
                  <button
                    className="rounded-full border border-white/10 bg-white/[0.08] px-5 py-2 text-sm text-white/90 transition-colors hover:bg-white/[0.14]"
                    onClick={() => {
                      revokePreviewUrls(previewIconUrls);
                      revokePreviewUrls(darkPreviewIconUrls);
                      setPreviewIconUrls(createEmptyPreviewUrls());
                      setDarkPreviewIconUrls(createEmptyPreviewUrls());
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
