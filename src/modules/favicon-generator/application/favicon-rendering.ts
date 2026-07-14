import {
  createDefaultFaviconRenderSettings,
  drawFaviconSource,
  FAVICON_SIZES,
  faviconFileName,
  faviconMaskableFileName,
  type FaviconRenderSettings,
  type GeneratedFaviconAsset,
} from "@/modules/favicon-generator/domain/favicon-generator";

export type GeneratedIcon = GeneratedFaviconAsset & { url: string };
export type FaviconRenderTarget = "browser" | "apple" | "android";
export type FaviconRenderSettingsByTarget = Record<
  FaviconRenderTarget,
  FaviconRenderSettings
>;
export type FaviconPreviewUrlsByTarget = Record<
  FaviconRenderTarget,
  string | null
>;

export const FAVICON_RENDER_TARGETS: FaviconRenderTarget[] = [
  "browser",
  "apple",
  "android",
];

export function createDefaultFaviconRenderSettingsByTarget(): FaviconRenderSettingsByTarget {
  const browser = createDefaultFaviconRenderSettings();
  const apple = createDefaultFaviconRenderSettings();
  const android = createDefaultFaviconRenderSettings();

  return {
    browser: { ...browser, cornerShape: "round", roundness: 0.33 },
    apple: { ...apple, cornerShape: "squircle", roundness: 0.33 },
    android: { ...android, cornerShape: "squircle", roundness: 0.33 },
  };
}

export function createEmptyPreviewUrls(): FaviconPreviewUrlsByTarget {
  return { browser: null, apple: null, android: null };
}

export function revokePreviewUrls(urls: FaviconPreviewUrlsByTarget) {
  Object.values(urls).forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
}

function targetForSize(size: number): FaviconRenderTarget {
  if (size === 180) return "apple";
  if (size === 192 || size === 512) return "android";
  return "browser";
}

function loadImage(file: File): Promise<HTMLImageElement> {
  const image = new Image();
  const sourceUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("image-load-error"));
    };
    image.src = sourceUrl;
  });
}

export async function generateRenderedIcons(
  file: File,
  settingsByTarget: FaviconRenderSettingsByTarget,
  variant: "regular" | "dark" = "regular",
): Promise<GeneratedIcon[]> {
  const image = await loadImage(file);
  const created: GeneratedIcon[] = [];

  try {
    const renderIcon = async (
      size: number,
      settings: FaviconRenderSettings,
      fileName: string,
    ) => {
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
        settings,
      );
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return null;
      const icon = {
        size,
        blob,
        fileName,
        url: URL.createObjectURL(blob),
      };
      created.push(icon);
      return icon;
    };
    const regularJobs = FAVICON_SIZES.map((size) =>
      renderIcon(
        size,
        settingsByTarget[targetForSize(size)],
        faviconFileName(size, variant),
      ),
    );
    const androidSettings = settingsByTarget.android;
    const maskableSettings: FaviconRenderSettings = {
      ...androidSettings,
      backgroundEnabled: true,
      cornerShape: "square",
      fit: "contain",
      roundness: 0,
      scale: Math.min(androidSettings.scale, 1) * 0.8,
    };
    const maskableJobs = ([192, 512] as const).map((size) =>
      renderIcon(
        size,
        maskableSettings,
        faviconMaskableFileName(size, variant),
      ),
    );
    const icons = await Promise.all([...regularJobs, ...maskableJobs]);

    return icons.filter((icon): icon is GeneratedIcon => icon !== null);
  } catch (error) {
    created.forEach((icon) => URL.revokeObjectURL(icon.url));
    throw error;
  }
}

export async function generatePreviewIconUrl(
  file: File,
  settings: FaviconRenderSettings,
): Promise<string | null> {
  try {
    const image = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    if (!context) return null;

    drawFaviconSource(
      context,
      image,
      96,
      image.naturalWidth,
      image.naturalHeight,
      settings,
    );
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    return blob ? URL.createObjectURL(blob) : null;
  } catch {
    return null;
  }
}
