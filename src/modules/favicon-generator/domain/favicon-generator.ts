export const FAVICON_SIZES = [16, 32, 48, 64, 128, 150, 180, 192, 256, 512];

export type FaviconFitMode = "contain" | "crop" | "stretch";

export type FaviconRenderSettings = {
  fit: FaviconFitMode;
  scale: number;
  roundness: number;
  tintEnabled: boolean;
  tintColor: string;
  backgroundEnabled: boolean;
  backgroundColor: string;
};

export type GeneratedFaviconAsset = {
  size: number;
  blob: Blob;
  fileName: string;
  url?: string;
};

export type FaviconPackageOptions = {
  appName: string;
  shortName?: string;
  themeColor: string;
  backgroundColor: string;
  faviconPath?: string;
  version?: string;
};

export type GeneratedPackageFile = {
  name: string;
  blob: Blob;
};

export function createDefaultFaviconRenderSettings(): FaviconRenderSettings {
  return {
    fit: "contain",
    scale: 1,
    roundness: 0,
    tintEnabled: false,
    tintColor: "#111111",
    backgroundEnabled: false,
    backgroundColor: "#ffffff",
  };
}

function normalizeHexColor(value: string, fallback: string): string {
  const candidate = value.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(candidate) ? candidate : fallback;
}

export function clampFaviconScale(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.min(2, Math.max(0, value));
}

export function clampFaviconRoundness(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function normalizeAppName(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : "LocalTools";
}

export function normalizeShortName(value: string, appName: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length === 0) {
    return appName.slice(0, 12);
  }
  return normalized.slice(0, 24);
}

export function normalizeFaviconPath(value: string): string {
  const normalized = value.trim();
  if (!normalized || normalized === "/") return "/";
  const withoutEdges = normalized.replace(/^\/+|\/+$/g, "");
  return withoutEdges ? `/${withoutEdges}/` : "/";
}

export function normalizeVersionTag(value: string): string {
  return value.trim().replace(/\s+/g, "-").slice(0, 64);
}

function buildAssetHref(
  fileName: string,
  options: FaviconPackageOptions,
): string {
  const path = normalizeFaviconPath(options.faviconPath ?? "/");
  const version = normalizeVersionTag(options.version ?? "");
  const href = `${path === "/" ? "/" : path}${fileName}`;
  return version ? `${href}?v=${encodeURIComponent(version)}` : href;
}

export function faviconFileName(
  size: number,
  variant: "regular" | "dark" = "regular",
): string {
  if (size === 180) {
    return variant === "dark"
      ? "apple-touch-icon-dark.png"
      : "apple-touch-icon.png";
  }
  if (size === 192) {
    return variant === "dark"
      ? "android-chrome-dark-192x192.png"
      : "android-chrome-192x192.png";
  }
  if (size === 512) {
    return variant === "dark"
      ? "android-chrome-dark-512x512.png"
      : "android-chrome-512x512.png";
  }
  if (variant === "dark") {
    return `favicon-dark-${size}x${size}.png`;
  }
  return `favicon-${size}x${size}.png`;
}

function buildRoundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

export function drawFaviconSource(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  outputSize: number,
  sourceWidth: number,
  sourceHeight: number,
  settings: FaviconRenderSettings,
) {
  const fit = settings.fit;
  const scale = clampFaviconScale(settings.scale);
  const roundness = clampFaviconRoundness(settings.roundness);
  const tintColor = normalizeHexColor(settings.tintColor, "#111111");
  const backgroundColor = normalizeHexColor(
    settings.backgroundColor,
    "#ffffff",
  );

  context.clearRect(0, 0, outputSize, outputSize);

  if (settings.backgroundEnabled || roundness > 0) {
    context.save();
    buildRoundedRectPath(
      context,
      0,
      0,
      outputSize,
      outputSize,
      outputSize * roundness * 0.5,
    );
    context.clip();
    if (settings.backgroundEnabled) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, outputSize, outputSize);
    }
  }

  let destinationWidth = outputSize;
  let destinationHeight = outputSize;
  let destinationX = 0;
  let destinationY = 0;

  if (fit === "stretch") {
    const stretched = outputSize * scale;
    destinationWidth = stretched;
    destinationHeight = stretched;
    destinationX = (outputSize - destinationWidth) / 2;
    destinationY = (outputSize - destinationHeight) / 2;
  } else {
    const imageRatio = sourceWidth / sourceHeight;
    const targetRatio = 1;
    const useContain = fit === "contain";
    const scaleBase = useContain
      ? imageRatio > targetRatio
        ? outputSize / sourceWidth
        : outputSize / sourceHeight
      : imageRatio > targetRatio
        ? outputSize / sourceHeight
        : outputSize / sourceWidth;

    destinationWidth = sourceWidth * scaleBase * scale;
    destinationHeight = sourceHeight * scaleBase * scale;
    destinationX = (outputSize - destinationWidth) / 2;
    destinationY = (outputSize - destinationHeight) / 2;
  }

  context.drawImage(
    image,
    destinationX,
    destinationY,
    destinationWidth,
    destinationHeight,
  );

  if (settings.tintEnabled) {
    context.save();
    context.globalCompositeOperation = "source-atop";
    context.fillStyle = tintColor;
    context.fillRect(0, 0, outputSize, outputSize);
    context.restore();
  }

  if (settings.backgroundEnabled || roundness > 0) {
    context.restore();
  }
}

export function buildManifestContent(
  icons: GeneratedFaviconAsset[],
  options: FaviconPackageOptions,
): string {
  const appName = normalizeAppName(options.appName);
  const shortName = normalizeShortName(options.shortName ?? "", appName);
  const themeColor = normalizeHexColor(options.themeColor, "#111111");
  const backgroundColor = normalizeHexColor(options.backgroundColor, "#ffffff");

  const manifestIcons = icons
    .filter((icon) => icon.size >= 192)
    .sort((a, b) => a.size - b.size)
    .map((icon) => ({
      src: buildAssetHref(icon.fileName, options),
      sizes: `${icon.size}x${icon.size}`,
      type: "image/png",
      purpose: "any",
    }));

  return JSON.stringify(
    {
      name: appName,
      short_name: shortName,
      start_url: ".",
      display: "standalone",
      background_color: backgroundColor,
      theme_color: themeColor,
      icons: manifestIcons,
    },
    null,
    2,
  );
}

export function buildBrowserConfigContent(
  icons: GeneratedFaviconAsset[],
  options: FaviconPackageOptions,
): string {
  const backgroundColor = normalizeHexColor(options.backgroundColor, "#ffffff");
  const tileIcon =
    icons.find((icon) => icon.size === 150) ??
    icons.find((icon) => icon.size === 192) ??
    icons[0];

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    "<browserconfig>",
    "  <msapplication>",
    "    <tile>",
    `      <square150x150logo src="${buildAssetHref(tileIcon?.fileName ?? "favicon-150x150.png", options)}"/>`,
    `      <TileColor>${backgroundColor}</TileColor>`,
    "    </tile>",
    "  </msapplication>",
    "</browserconfig>",
  ].join("\n");
}

export function buildHtmlSnippet(
  icons: GeneratedFaviconAsset[],
  options: FaviconPackageOptions,
  darkIcons: GeneratedFaviconAsset[] = [],
): string {
  const themeColor = normalizeHexColor(options.themeColor, "#111111");

  const faviconIcons = icons
    .filter((icon) => icon.size === 16 || icon.size === 32)
    .sort((a, b) => a.size - b.size)
    .map(
      (icon) =>
        `<link rel="icon" type="image/png" sizes="${icon.size}x${icon.size}" href="${buildAssetHref(icon.fileName, options)}" />`,
    );
  const darkFaviconIcons = darkIcons
    .filter((icon) => icon.size === 16 || icon.size === 32)
    .sort((a, b) => a.size - b.size)
    .map(
      (icon) =>
        `<link rel="icon" type="image/png" sizes="${icon.size}x${icon.size}" href="${buildAssetHref(icon.fileName, options)}" media="(prefers-color-scheme: dark)" />`,
    );

  const appleIcon = icons.find((icon) => icon.size === 180);
  const darkAppleIcon = darkIcons.find((icon) => icon.size === 180);

  return [
    ...faviconIcons,
    ...darkFaviconIcons,
    `<link rel="icon" href="${buildAssetHref("favicon.ico", options)}" sizes="any" />`,
    appleIcon
      ? `<link rel="apple-touch-icon" sizes="180x180" href="${buildAssetHref(appleIcon.fileName, options)}" />`
      : null,
    darkAppleIcon
      ? `<link rel="apple-touch-icon" sizes="180x180" href="${buildAssetHref(darkAppleIcon.fileName, options)}" media="(prefers-color-scheme: dark)" />`
      : null,
    `<link rel="manifest" href="${buildAssetHref("site.webmanifest", options)}" />`,
    `<meta name="theme-color" content="${themeColor}" />`,
    `<meta name="msapplication-config" content="${buildAssetHref("browserconfig.xml", options)}" />`,
  ]
    .filter(Boolean)
    .join("\n");
}

function numberToLittleEndianBytes(value: number, length: number): number[] {
  return Array.from({ length }, (_, index) => (value >> (index * 8)) & 0xff);
}

async function createIcoBlob(
  icons: GeneratedFaviconAsset[],
): Promise<Blob | null> {
  const icoIcons = icons
    .filter((icon) => [16, 32, 48].includes(icon.size))
    .sort((a, b) => a.size - b.size);

  if (icoIcons.length === 0) {
    return null;
  }

  const pngBuffers = await Promise.all(
    icoIcons.map(async (icon) => ({
      size: icon.size,
      bytes: new Uint8Array(await icon.blob.arrayBuffer()),
    })),
  );

  const headerSize = 6;
  const entrySize = 16;
  const imageDataOffset = headerSize + entrySize * pngBuffers.length;

  const directory: number[] = [
    0,
    0,
    1,
    0,
    ...numberToLittleEndianBytes(pngBuffers.length, 2),
  ];

  let currentOffset = imageDataOffset;
  const entries: number[] = [];

  for (const icon of pngBuffers) {
    const sizeByte = icon.size >= 256 ? 0 : icon.size;
    entries.push(
      sizeByte,
      sizeByte,
      0,
      0,
      1,
      0,
      32,
      0,
      ...numberToLittleEndianBytes(icon.bytes.byteLength, 4),
      ...numberToLittleEndianBytes(currentOffset, 4),
    );
    currentOffset += icon.bytes.byteLength;
  }

  const totalLength =
    directory.length +
    entries.length +
    pngBuffers.reduce((sum, icon) => sum + icon.bytes.byteLength, 0);
  const output = new Uint8Array(totalLength);

  let cursor = 0;
  output.set(directory, cursor);
  cursor += directory.length;
  output.set(entries, cursor);
  cursor += entries.length;

  for (const icon of pngBuffers) {
    output.set(icon.bytes, cursor);
    cursor += icon.bytes.byteLength;
  }

  return new Blob([output], { type: "image/x-icon" });
}

export async function buildFaviconPackage(
  icons: GeneratedFaviconAsset[],
  options: FaviconPackageOptions,
  darkIcons: GeneratedFaviconAsset[] = [],
): Promise<GeneratedPackageFile[]> {
  const files: GeneratedPackageFile[] = icons.map((icon) => ({
    name: icon.fileName,
    blob: icon.blob,
  }));
  files.push(
    ...darkIcons.map((icon) => ({
      name: icon.fileName,
      blob: icon.blob,
    })),
  );

  const icoBlob = await createIcoBlob(icons);
  if (icoBlob) {
    files.unshift({ name: "favicon.ico", blob: icoBlob });
  }

  files.push(
    {
      name: "site.webmanifest",
      blob: new Blob([buildManifestContent(icons, options)], {
        type: "application/manifest+json",
      }),
    },
    {
      name: "browserconfig.xml",
      blob: new Blob([buildBrowserConfigContent(icons, options)], {
        type: "application/xml;charset=utf-8",
      }),
    },
    {
      name: "favicon-snippet.html",
      blob: new Blob([buildHtmlSnippet(icons, options, darkIcons)], {
        type: "text/html;charset=utf-8",
      }),
    },
  );

  return files;
}
