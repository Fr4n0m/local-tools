export const MAX_FAVICON_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_FAVICON_DIMENSION = 8192;
export const MAX_FAVICON_PIXELS = 40_000_000;

export type FaviconImageValidationError =
  | "too-large"
  | "unsupported-type"
  | "unsafe-svg"
  | "invalid-image"
  | "dimensions-too-large";

export type FaviconImageValidationResult =
  { ok: true } | { ok: false; error: FaviconImageValidationError };

type SupportedImageType =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/gif"
  | "image/bmp"
  | "image/svg+xml";

const SUPPORTED_TYPES = new Set<SupportedImageType>([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
]);

function sniffRasterType(bytes: Uint8Array): SupportedImageType | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  if (bytes.length >= 6) {
    const signature = String.fromCharCode(...bytes.slice(0, 6));
    if (signature === "GIF87a" || signature === "GIF89a") return "image/gif";
  }
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return "image/bmp";
  }
  return null;
}

function isSafeSvg(source: string): boolean {
  const normalized = source.replace(/^\uFEFF/, "").trim();
  if (!/^<\?xml[\s\S]*?\?>\s*<svg\b|^<svg\b/i.test(normalized)) return false;
  if (
    /<\s*(script|foreignObject|iframe|object|embed|style)\b/i.test(normalized)
  ) {
    return false;
  }
  if (/<!ENTITY\b|\son[a-z]+\s*=|@import\b/i.test(normalized)) return false;
  if (/(?:href|xlink:href)\s*=\s*["'](?!#|data:image\/)/i.test(normalized)) {
    return false;
  }
  if (/url\(\s*["']?(?!#|data:image\/)/i.test(normalized)) return false;
  return true;
}

async function inspectFileType(
  file: File,
): Promise<SupportedImageType | "unsafe-svg" | null> {
  const declaredType = file.type.toLowerCase();
  const extensionSuggestsSvg = file.name.toLowerCase().endsWith(".svg");
  const svgCandidate = declaredType === "image/svg+xml" || extensionSuggestsSvg;

  if (svgCandidate) {
    const source = await file.text();
    return isSafeSvg(source) ? "image/svg+xml" : "unsafe-svg";
  }

  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const detectedType = sniffRasterType(bytes);
  if (!detectedType) return null;
  if (declaredType && declaredType !== detectedType) return null;
  return detectedType;
}

async function validateDimensions(
  file: File,
): Promise<FaviconImageValidationResult> {
  const url = URL.createObjectURL(file);
  const image = new Image();

  try {
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        image.onload = () =>
          resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error("invalid-image"));
        image.src = url;
      },
    );
    if (dimensions.width <= 0 || dimensions.height <= 0) {
      return { ok: false, error: "invalid-image" };
    }
    if (
      dimensions.width > MAX_FAVICON_DIMENSION ||
      dimensions.height > MAX_FAVICON_DIMENSION ||
      dimensions.width * dimensions.height > MAX_FAVICON_PIXELS
    ) {
      return { ok: false, error: "dimensions-too-large" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "invalid-image" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function validateFaviconImageFile(
  file: File,
): Promise<FaviconImageValidationResult> {
  if (file.size > MAX_FAVICON_FILE_BYTES) {
    return { ok: false, error: "too-large" };
  }

  const type = await inspectFileType(file);
  if (type === "unsafe-svg") return { ok: false, error: "unsafe-svg" };
  if (!type || !SUPPORTED_TYPES.has(type)) {
    return { ok: false, error: "unsupported-type" };
  }

  return validateDimensions(file);
}
