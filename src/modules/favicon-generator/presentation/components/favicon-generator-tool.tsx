"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  IconWorld,
  IconWorldWww,
} from "@tabler/icons-react";

import {
  buildBrowserConfigContent,
  buildFaviconPackage,
  buildHtmlSnippet,
  buildManifestContent,
  type FaviconRenderSettings,
  normalizeAppName,
  normalizeFaviconPath,
  normalizeShortName,
  normalizeVersionTag,
} from "@/modules/favicon-generator/domain/favicon-generator";
import en from "@/modules/favicon-generator/presentation/i18n/en.json";
import es from "@/modules/favicon-generator/presentation/i18n/es.json";
import {
  validateFaviconImageFile,
  type FaviconImageValidationError,
} from "@/modules/favicon-generator/application/validate-favicon-image";
import {
  createDefaultFaviconRenderSettingsByTarget,
  createEmptyPreviewUrls,
  FAVICON_RENDER_TARGETS,
  generatePreviewIconUrl,
  generateRenderedIcons,
  revokePreviewUrls,
  type FaviconPreviewUrlsByTarget,
  type FaviconRenderSettingsByTarget,
  type FaviconRenderTarget,
  type GeneratedIcon,
} from "@/modules/favicon-generator/application/favicon-rendering";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { downloadTextFile } from "@/shared/lib/download";
import { createZipBlob } from "@/shared/lib/zip";
import {
  AnimatedLayoutGroup,
  AnimatedLayoutItem,
} from "@/shared/presentation/components/animated-layout";
import { ToolDropSurface } from "@/shared/presentation/components/tool-drop-surface";
import { GuidedToolFlow } from "@/shared/presentation/components/guided-tool-flow";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ToolColorPicker,
  ToolField,
  ToolFileDrop,
  ToolInput,
  ToolSection,
  ToolSwitch,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import type { Language } from "@/shared/presentation/i18n";
import type { ToolExperienceMode } from "@/modules/tool-registry/domain/tool";
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
import {
  RenderSettingsFields,
  SettingsHeading,
  StyleOverrideButton,
} from "./favicon-render-settings-fields";

type Props = {
  language: Language;
  experienceMode: ToolExperienceMode;
  onExperienceModeChange: (mode: ToolExperienceMode) => void;
};

const EMPTY_GENERATED_ICONS: GeneratedIcon[] = [];
type GlobalIconStyle = Pick<
  FaviconRenderSettings,
  "backgroundColor" | "backgroundEnabled" | "tintColor" | "tintEnabled"
>;
type TargetStyleOverrides = Record<FaviconRenderTarget, boolean>;

const DEFAULT_PWA_BACKGROUND_COLOR = "#ffffff";
const DEFAULT_PWA_THEME_COLOR = "#111111";
const FAVICON_IMAGE_ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml";

export function FaviconGeneratorTool({
  language,
  experienceMode,
  onExperienceModeChange,
}: Props) {
  const text = useMemo(() => (language === "es" ? es : en), [language]);
  const sharedText = sharedMessages[language];
  const [file, setFile] = useState<File | null>(null);
  const [darkFile, setDarkFile] = useState<File | null>(null);
  const [sourceFilePreviewUrl, setSourceFilePreviewUrl] = useState("");
  const [darkSourceFilePreviewUrl, setDarkSourceFilePreviewUrl] = useState("");
  const [fileError, setFileError] =
    useState<FaviconImageValidationError | null>(null);
  const [darkFileError, setDarkFileError] =
    useState<FaviconImageValidationError | null>(null);
  const [useDedicatedDarkIcon, setUseDedicatedDarkIcon] = useState(false);
  const [generated, setGenerated] = useState<GeneratedIcon[]>([]);
  const [generatedDark, setGeneratedDark] = useState<GeneratedIcon[]>([]);
  const [generatedFingerprint, setGeneratedFingerprint] = useState("");
  const [generationStatus, setGenerationStatus] = useState<
    "idle" | "processing" | "error"
  >("idle");
  const generationJobRef = useRef(0);
  const regularValidationJobRef = useRef(0);
  const darkValidationJobRef = useRef(0);
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
  const generationFingerprint = useMemo(
    () =>
      JSON.stringify({
        file: file
          ? [file.name, file.size, file.type, file.lastModified]
          : null,
        darkFile:
          useDedicatedDarkIcon && darkFile
            ? [
                darkFile.name,
                darkFile.size,
                darkFile.type,
                darkFile.lastModified,
              ]
            : null,
        renderSettingsByTarget,
        useDedicatedDarkIcon,
      }),
    [darkFile, file, renderSettingsByTarget, useDedicatedDarkIcon],
  );
  const exportedGenerated =
    generatedFingerprint === generationFingerprint
      ? generated
      : EMPTY_GENERATED_ICONS;
  const exportedGeneratedDark =
    generatedFingerprint === generationFingerprint
      ? generatedDark
      : EMPTY_GENERATED_ICONS;
  const invalidatePendingGeneration = () => {
    generationJobRef.current += 1;
    setGenerationStatus("idle");
  };
  const updateGlobalIconStyle = (update: Partial<GlobalIconStyle>) => {
    invalidatePendingGeneration();
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
    invalidatePendingGeneration();
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
    invalidatePendingGeneration();
    setRenderSettingsByTarget((current) => ({
      ...current,
      [target]: update(current[target]),
    }));
  };
  const onDedicatedDarkIconChange = (checked: boolean) => {
    invalidatePendingGeneration();
    setUseDedicatedDarkIcon(checked);
  };

  const projectName = useMemo(() => normalizeAppName(appName), [appName]);

  const manifestContent = useMemo(() => {
    if (exportedGenerated.length === 0) {
      return "";
    }

    return buildManifestContent(
      exportedGenerated,
      {
        appName: projectName,
        shortName: normalizeShortName(shortName, projectName),
        themeColor,
        backgroundColor,
        faviconPath,
        version: versionTag,
        androidIconVariant: "regular",
      },
      exportedGeneratedDark,
    );
  }, [
    backgroundColor,
    faviconPath,
    exportedGenerated,
    exportedGeneratedDark,
    projectName,
    shortName,
    themeColor,
    versionTag,
  ]);

  const browserConfigContent = useMemo(() => {
    if (exportedGenerated.length === 0) {
      return "";
    }

    return buildBrowserConfigContent(exportedGenerated, {
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
    exportedGenerated,
    projectName,
    shortName,
    themeColor,
    versionTag,
  ]);

  const htmlSnippet = useMemo(() => {
    if (exportedGenerated.length === 0) {
      return "";
    }

    return buildHtmlSnippet(
      exportedGenerated,
      {
        appName: projectName,
        shortName: normalizeShortName(shortName, projectName),
        themeColor,
        backgroundColor,
        faviconPath,
        version: versionTag,
        appleTouchIconVariant: "regular",
      },
      exportedGeneratedDark,
    );
  }, [
    backgroundColor,
    faviconPath,
    exportedGenerated,
    exportedGeneratedDark,
    projectName,
    shortName,
    themeColor,
    versionTag,
  ]);

  useEffect(
    () => () => {
      if (sourceFilePreviewUrl) URL.revokeObjectURL(sourceFilePreviewUrl);
    },
    [sourceFilePreviewUrl],
  );

  useEffect(
    () => () => {
      if (darkSourceFilePreviewUrl) {
        URL.revokeObjectURL(darkSourceFilePreviewUrl);
      }
    },
    [darkSourceFilePreviewUrl],
  );

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

    if (!file) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const run = async () => {
        const sourceForDark =
          useDedicatedDarkIcon && darkFile ? darkFile : file;
        const [regularPreviewEntries, darkPreviewEntries] = await Promise.all([
          Promise.all(
            FAVICON_RENDER_TARGETS.map(async (target) => [
              target,
              await generatePreviewIconUrl(
                file,
                renderSettingsByTarget[target],
              ),
            ]),
          ),
          Promise.all(
            FAVICON_RENDER_TARGETS.map(async (target) => [
              target,
              await generatePreviewIconUrl(
                sourceForDark,
                renderSettingsByTarget[target],
              ),
            ]),
          ),
        ]);

        const regularUrls = Object.fromEntries(
          regularPreviewEntries,
        ) as FaviconPreviewUrlsByTarget;
        const darkUrls = Object.fromEntries(
          darkPreviewEntries,
        ) as FaviconPreviewUrlsByTarget;
        if (cancelled) {
          revokePreviewUrls(regularUrls);
          revokePreviewUrls(darkUrls);
          return;
        }

        setPreviewIconUrls((current) => {
          revokePreviewUrls(current);
          return regularUrls;
        });
        setDarkPreviewIconUrls((current) => {
          revokePreviewUrls(current);
          return darkUrls;
        });
      };

      void run();
    }, 140);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [darkFile, file, renderSettingsByTarget, useDedicatedDarkIcon]);

  useEffect(() => () => {
    generationJobRef.current += 1;
  });

  const onGenerate = async () => {
    if (!file) {
      return;
    }

    const jobId = generationJobRef.current + 1;
    generationJobRef.current = jobId;
    const requestedFingerprint = generationFingerprint;
    setGenerationStatus("processing");

    try {
      const results = await Promise.allSettled([
        generateRenderedIcons(file, renderSettingsByTarget),
        useDedicatedDarkIcon && darkFile
          ? generateRenderedIcons(darkFile, renderSettingsByTarget, "dark")
          : Promise.resolve([]),
      ]);
      const [regularResult, darkResult] = results;
      if (
        regularResult.status === "rejected" ||
        darkResult.status === "rejected"
      ) {
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            result.value.forEach((icon) => URL.revokeObjectURL(icon.url));
          }
        });
        throw new Error("favicon-generation-failed");
      }
      const icons = regularResult.value;
      const darkIcons = darkResult.value;

      if (generationJobRef.current !== jobId) {
        icons.forEach((icon) => URL.revokeObjectURL(icon.url));
        darkIcons.forEach((icon) => URL.revokeObjectURL(icon.url));
        return;
      }

      generated.forEach((icon) => URL.revokeObjectURL(icon.url));
      generatedDark.forEach((icon) => URL.revokeObjectURL(icon.url));
      setGenerated(icons);
      setGeneratedDark(darkIcons);
      setGeneratedFingerprint(requestedFingerprint);
      setGenerationStatus("idle");
    } catch {
      if (generationJobRef.current === jobId) {
        setGenerationStatus("error");
      }
    }
  };

  const onDropFiles = async (nextFiles: File[]) => {
    const nextFile = nextFiles[0];
    if (!nextFile) {
      return;
    }
    const appNameBeforeValidation = appName;
    const shortNameBeforeValidation = shortName;
    const validationJob = regularValidationJobRef.current + 1;
    regularValidationJobRef.current = validationJob;
    const validation = await validateFaviconImageFile(nextFile);
    if (regularValidationJobRef.current !== validationJob) {
      return;
    }
    if (!validation.ok) {
      setFileError(validation.error);
      return;
    }
    const nextProjectName = normalizeAppName(
      nextFile.name.replace(/\.[^.]+$/, "") || nextFile.name,
    );
    generationJobRef.current += 1;
    setGenerationStatus("idle");
    setFileError(null);
    setFile(nextFile);
    setSourceFilePreviewUrl(URL.createObjectURL(nextFile));
    setAppName((current) =>
      current === appNameBeforeValidation ? nextProjectName : current,
    );
    setShortName((current) =>
      current === shortNameBeforeValidation
        ? normalizeShortName("", nextProjectName)
        : current,
    );
  };

  const onDropDarkFiles = async (nextFiles: File[]) => {
    const nextFile = nextFiles[0];
    if (!nextFile) {
      return;
    }
    const validationJob = darkValidationJobRef.current + 1;
    darkValidationJobRef.current = validationJob;
    const validation = await validateFaviconImageFile(nextFile);
    if (darkValidationJobRef.current !== validationJob) {
      return;
    }
    if (!validation.ok) {
      setDarkFileError(validation.error);
      return;
    }
    generationJobRef.current += 1;
    setGenerationStatus("idle");
    setDarkFileError(null);
    setDarkFile(nextFile);
    setDarkSourceFilePreviewUrl(URL.createObjectURL(nextFile));
  };

  const onDownloadZip = async () => {
    if (exportedGenerated.length === 0) {
      return;
    }

    const packageFiles = await buildFaviconPackage(
      exportedGenerated,
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
      exportedGeneratedDark,
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

  if (experienceMode === "compact") {
    const guidedText = text.guided;
    const guidedSteps = [
      {
        id: "source",
        title: guidedText.sourceTitle,
        description: guidedText.sourceDescription,
        icon: <IconPhotoCog className="h-5 w-5" />,
        canContinue: Boolean(file),
        blockedMessage: guidedText.sourceBlocked,
        content: (
          <div className="mx-auto grid w-full max-w-2xl gap-4">
            <ToolFileDrop
              accept={FAVICON_IMAGE_ACCEPT}
              currentFileText={
                file ? `${text.currentFile}: ${file.name}` : null
              }
              dropHint={text.dropHint}
              inputAriaLabel={text.inputLabel}
              label={text.inputLabel}
              onSelectFiles={onDropFiles}
            />
            {fileError ? (
              <p className="text-sm font-medium text-destructive" role="alert">
                {text.fileErrors[fileError]}
              </p>
            ) : null}
            {file && sourceFilePreviewUrl ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-secondary/60 p-3 dark:bg-[#181818]">
                  <div
                    aria-label={`${text.currentFile}: ${file.name}`}
                    className="h-16 w-16 shrink-0 rounded-[22%] bg-contain bg-center bg-no-repeat"
                    role="img"
                    style={{
                      backgroundImage: `url(${sourceFilePreviewUrl})`,
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground/48">
                      {text.lightPreviewLabel}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-foreground/82">
                      {file.name}
                    </p>
                  </div>
                </div>
                {useDedicatedDarkIcon &&
                darkFile &&
                darkSourceFilePreviewUrl ? (
                  <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-secondary/60 p-3 dark:bg-[#181818]">
                    <div
                      aria-label={`${text.darkCurrentFile}: ${darkFile.name}`}
                      className="h-16 w-16 shrink-0 rounded-[22%] bg-contain bg-center bg-no-repeat"
                      role="img"
                      style={{
                        backgroundImage: `url(${darkSourceFilePreviewUrl})`,
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground/48">
                        {text.darkPreviewLabel}
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-foreground/82">
                        {darkFile.name}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border/85 bg-[var(--tool-control-bg)] px-3 py-1.5 shadow-[2px_2px_0_var(--surface-shadow-color)] dark:border-white/22">
              <ToolSwitch
                aria-label={text.darkIconToggleLabel}
                checked={useDedicatedDarkIcon}
                onChange={onDedicatedDarkIconChange}
              />
              <span className="min-w-0 flex-1 text-xs font-medium text-foreground/75">
                {text.darkIconToggleLabel}
              </span>
              {useDedicatedDarkIcon ? (
                <ToolFileDrop
                  accept={FAVICON_IMAGE_ACCEPT}
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
            {darkFileError ? (
              <p className="text-sm font-medium text-destructive" role="alert">
                {text.fileErrors[darkFileError]}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "identity",
        title: guidedText.identityTitle,
        description: guidedText.identityDescription,
        icon: <IconPalette className="h-5 w-5" />,
        content: (
          <div className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-2">
            <ToolField
              htmlFor="guided-favicon-app-name"
              label={text.appNameLabel}
            >
              <ToolInput
                id="guided-favicon-app-name"
                onChange={(event) => setAppName(event.target.value)}
                value={appName}
              />
            </ToolField>
            <ToolField
              htmlFor="guided-favicon-short-name"
              label={text.shortNameLabel}
            >
              <ToolInput
                id="guided-favicon-short-name"
                maxLength={24}
                onChange={(event) => setShortName(event.target.value)}
                value={shortName}
              />
            </ToolField>
            <ToolField htmlFor="guided-favicon-path" label={text.pathLabel}>
              <ToolInput
                id="guided-favicon-path"
                onChange={(event) =>
                  setFaviconPath(normalizeFaviconPath(event.target.value))
                }
                placeholder="/"
                value={faviconPath}
              />
            </ToolField>
            <ToolField
              htmlFor="guided-favicon-version"
              label={text.versionLabel}
            >
              <ToolInput
                id="guided-favicon-version"
                onChange={(event) =>
                  setVersionTag(normalizeVersionTag(event.target.value))
                }
                placeholder="2026-07"
                value={versionTag}
              />
            </ToolField>
            <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
              <div className="grid gap-2 rounded-2xl bg-secondary/60 p-3 dark:bg-[#181818]">
                <div className="flex items-center gap-2">
                  <ToolSwitch
                    aria-label={text.tintToggleLabel}
                    checked={globalIconStyle.tintEnabled}
                    onChange={(tintEnabled) =>
                      updateGlobalIconStyle({ tintEnabled })
                    }
                  />
                  <span className="text-sm font-medium">
                    {text.tintToggleLabel}
                  </span>
                </div>
                <ToolColorPicker
                  disabled={!globalIconStyle.tintEnabled}
                  onChange={(tintColor) => updateGlobalIconStyle({ tintColor })}
                  value={globalIconStyle.tintColor}
                />
              </div>
              <div className="grid gap-2 rounded-2xl bg-secondary/60 p-3 dark:bg-[#181818]">
                <div className="flex items-center gap-2">
                  <ToolSwitch
                    aria-label={text.backgroundToggleLabel}
                    checked={globalIconStyle.backgroundEnabled}
                    onChange={(backgroundEnabled) =>
                      updateGlobalIconStyle({ backgroundEnabled })
                    }
                  />
                  <span className="text-sm font-medium">
                    {text.backgroundToggleLabel}
                  </span>
                </div>
                <ToolColorPicker
                  disabled={!globalIconStyle.backgroundEnabled}
                  onChange={(backgroundColor) =>
                    updateGlobalIconStyle({ backgroundColor })
                  }
                  value={globalIconStyle.backgroundColor}
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "browser",
        title: guidedText.browserTitle,
        description: guidedText.browserDescription,
        icon: <IconWorld className="h-5 w-5" />,
        content: (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.7fr)]">
            <div className="grid gap-3">
              <PreviewModeCard label={text.lightPreviewLabel}>
                <BrowserPreviewMock
                  darkIconUrl={file ? darkPreviewIconUrls.browser : null}
                  label={normalizeShortName(shortName, projectName)}
                  lightIconUrl={file ? previewIconUrls.browser : null}
                  theme="light"
                />
              </PreviewModeCard>
              <PreviewModeCard dark label={text.darkPreviewLabel}>
                <BrowserPreviewMock
                  darkIconUrl={file ? darkPreviewIconUrls.browser : null}
                  label={normalizeShortName(shortName, projectName)}
                  lightIconUrl={file ? previewIconUrls.browser : null}
                  theme="dark"
                />
              </PreviewModeCard>
            </div>
            <section aria-labelledby="guided-browser-settings">
              <div className="mb-3 flex items-center justify-between gap-3">
                <SettingsHeading
                  id="guided-browser-settings"
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
          </div>
        ),
      },
      {
        id: "apple",
        title: guidedText.appleTitle,
        description: guidedText.appleDescription,
        icon: <IconBrandApple className="h-5 w-5" />,
        content: (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
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
            <section aria-labelledby="guided-apple-settings">
              <div className="mb-3 flex items-center justify-between gap-3">
                <SettingsHeading
                  id="guided-apple-settings"
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
          </div>
        ),
      },
      {
        id: "android",
        title: guidedText.androidTitle,
        description: guidedText.androidDescription,
        icon: <IconBrandAndroid className="h-5 w-5" />,
        content: (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
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
            <section aria-labelledby="guided-android-settings">
              <div className="mb-3 flex items-center justify-between gap-3">
                <SettingsHeading
                  id="guided-android-settings"
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
          </div>
        ),
      },
      {
        id: "export",
        title: guidedText.exportTitle,
        description: guidedText.exportDescription,
        icon: <IconDownload className="h-5 w-5" />,
        content: (
          <div className="mx-auto grid w-full max-w-5xl gap-5">
            <ToolActions
              actions={[
                {
                  label: text.generate,
                  onClick: () => void onGenerate(),
                  disabled: !file || generationStatus === "processing",
                  icon: <IconPhotoCog className="h-4 w-4" />,
                },
                {
                  label: sharedText.buttons.download,
                  onClick: () => void onDownloadZip(),
                  disabled:
                    exportedGenerated.length === 0 ||
                    generationStatus === "processing",
                  icon: <IconDownload className="h-4 w-4" />,
                },
              ]}
            />
            {generationStatus === "processing" ? (
              <p className="text-sm text-foreground/64" role="status">
                {text.processing}
              </p>
            ) : generationStatus === "error" ? (
              <p className="text-sm font-medium text-destructive" role="alert">
                {text.generationError}
              </p>
            ) : null}
            {exportedGenerated.length === 0 ? (
              <p className="rounded-2xl bg-secondary/55 p-5 text-sm text-foreground/64 dark:bg-[#181818]">
                {text.empty}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...exportedGenerated, ...exportedGeneratedDark].map(
                  (icon) => (
                    <a
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/55 p-3 text-sm shadow-[3px_3px_0_var(--surface-shadow-color)] dark:border-white/18"
                      download={icon.fileName}
                      href={icon.url}
                      key={icon.fileName}
                    >
                      <span>
                        {icon.size}×{icon.size}
                      </span>
                      <span className="truncate">{icon.fileName}</span>
                    </a>
                  ),
                )}
              </div>
            )}
          </div>
        ),
      },
    ];

    return (
      <ToolSection
        title={text.title}
        titleIcon={<IconWorldWww aria-hidden size={18} />}
      >
        <ToolDropSurface
          dropHint={text.dropHint}
          label={text.inputLabel}
          onSelectFiles={onDropFiles}
        >
          <GuidedToolFlow
            backLabel={guidedText.back}
            continueLabel={guidedText.continue}
            exitLabel={guidedText.exit}
            onExit={() => onExperienceModeChange("comfortable")}
            progressLabel={guidedText.progress}
            stepLabel={(current, total) =>
              guidedText.step
                .replace("{current}", String(current))
                .replace("{total}", String(total))
            }
            steps={guidedSteps}
          />
        </ToolDropSurface>
      </ToolSection>
    );
  }

  return (
    <ToolSection
      title={text.title}
      titleIcon={<IconWorldWww aria-hidden size={18} />}
    >
      <ToolDropSurface
        dropHint={text.dropHint}
        label={text.inputLabel}
        onSelectFiles={onDropFiles}
      >
        <div className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(320px,1.1fr)_minmax(0,2fr)] xl:items-start">
            <div className="grid gap-4">
              <ToolFileDrop
                accept={FAVICON_IMAGE_ACCEPT}
                currentFileText={
                  file ? `${text.currentFile}: ${file.name}` : null
                }
                dropHint={text.dropHint}
                inputAriaLabel={text.inputLabel}
                label={text.inputLabel}
                onSelectFiles={onDropFiles}
              />
              {fileError ? (
                <p
                  className="text-sm font-medium text-destructive"
                  role="alert"
                >
                  {text.fileErrors[fileError]}
                </p>
              ) : null}

              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border/85 bg-[var(--tool-control-bg)] px-3 py-1.5 shadow-[2px_2px_0_var(--surface-shadow-color)] dark:border-white/22">
                <ToolSwitch
                  aria-label={text.darkIconToggleLabel}
                  checked={useDedicatedDarkIcon}
                  onChange={onDedicatedDarkIconChange}
                />
                <span className="min-w-0 flex-1 text-xs font-medium text-foreground/75">
                  {text.darkIconToggleLabel}
                </span>

                {useDedicatedDarkIcon ? (
                  <ToolFileDrop
                    accept={FAVICON_IMAGE_ACCEPT}
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
              {darkFileError ? (
                <p
                  className="text-sm font-medium text-destructive"
                  role="alert"
                >
                  {text.fileErrors[darkFileError]}
                </p>
              ) : null}
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
                      setSourceFilePreviewUrl("");
                      setDarkSourceFilePreviewUrl("");
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
              disabled: !file || generationStatus === "processing",
              icon: <IconPhotoCog className="h-4 w-4" />,
            },
            {
              label: sharedText.buttons.download,
              onClick: () => {
                void onDownloadZip();
              },
              disabled:
                exportedGenerated.length === 0 ||
                generationStatus === "processing",
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
                setSourceFilePreviewUrl("");
                setDarkSourceFilePreviewUrl("");
                setGenerated([]);
                setGeneratedDark([]);
                setGeneratedFingerprint("");
                setGenerationStatus("idle");
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
        {generationStatus === "processing" ? (
          <p className="text-sm text-foreground/64" role="status">
            {text.processing}
          </p>
        ) : generationStatus === "error" ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {text.generationError}
          </p>
        ) : null}
        {exportedGenerated.length === 0 ? (
          <p className="text-sm">{text.empty}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">{text.result}</p>
            <AnimatedLayoutGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...exportedGenerated, ...exportedGeneratedDark].map((icon) => (
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
