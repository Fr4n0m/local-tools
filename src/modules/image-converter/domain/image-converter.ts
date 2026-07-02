export type OutputFormat =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/avif"
  | "image/jxl"
  | "image/qoi";

export type ConversionErrorCode =
  "image-load-error" | "canvas-unavailable" | "conversion-failed";

export class ImageConversionError extends Error {
  constructor(public readonly code: ConversionErrorCode) {
    super(code);
    this.name = "ImageConversionError";
  }
}

export const extensionForFormat: Record<OutputFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/jxl": "jxl",
  "image/qoi": "qoi",
};

export function basenameWithoutExtension(name: string): string {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex > 0 ? name.slice(0, dotIndex) : name;
}

export function convertedFileName(
  sourceName: string,
  format: OutputFormat,
  suffix = "-converted",
): string {
  return `${basenameWithoutExtension(sourceName)}${suffix}.${extensionForFormat[format]}`;
}

type DrawableImage = CanvasImageSource & { width: number; height: number };
type ConversionBrowser = {
  loadImage: (file: File) => Promise<DrawableImage>;
  createCanvas: (width: number, height: number) => HTMLCanvasElement;
};
export type ConvertImageOptions = {
  width?: number;
  height?: number;
};

function defaultLoadImage(file: File): Promise<DrawableImage> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageConversionError("image-load-error"));
    };
    image.src = url;
  });
}

const defaultBrowser: ConversionBrowser = {
  loadImage: defaultLoadImage,
  createCanvas: (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  },
};

function isBrowserCandidate(
  value: ConvertImageOptions | ConversionBrowser,
): value is ConversionBrowser {
  return "loadImage" in value && "createCanvas" in value;
}

function sanitizeDimension(
  value: number | undefined,
  fallback: number,
): number {
  if (!value || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.round(value));
}

async function encodeWithAdvancedCodec(
  imageData: ImageData,
  format: OutputFormat,
  quality: number,
): Promise<Blob | null> {
  if (format === "image/avif") {
    const { encode } = await import("@jsquash/avif");
    const buffer = await encode(imageData, {
      quality: Math.round(quality * 100),
    });
    return new Blob([buffer], { type: format });
  }

  if (format === "image/jxl") {
    const { encode } = await import("@jsquash/jxl");
    const buffer = await encode(imageData, {
      quality: Math.round(quality * 100),
    });
    return new Blob([buffer], { type: format });
  }

  if (format === "image/qoi") {
    const { encode } = await import("@jsquash/qoi");
    const buffer = await encode(imageData);
    return new Blob([buffer], { type: format });
  }

  return null;
}

export async function convertImageFile(
  file: File,
  format: OutputFormat,
  quality: number,
  optionsOrBrowser: ConvertImageOptions | ConversionBrowser = {},
  browserArg?: ConversionBrowser,
): Promise<Blob> {
  const options = isBrowserCandidate(optionsOrBrowser) ? {} : optionsOrBrowser;
  const browser = isBrowserCandidate(optionsOrBrowser)
    ? optionsOrBrowser
    : (browserArg ?? defaultBrowser);
  let image: DrawableImage;
  try {
    image = await browser.loadImage(file);
  } catch (error) {
    if (error instanceof ImageConversionError) throw error;
    throw new ImageConversionError("image-load-error");
  }
  const outputWidth = sanitizeDimension(options.width, image.width);
  const outputHeight = sanitizeDimension(options.height, image.height);
  const canvas = browser.createCanvas(outputWidth, outputHeight);
  const context = canvas.getContext("2d");
  if (!context) throw new ImageConversionError("canvas-unavailable");
  if (format === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  if (
    format === "image/avif" ||
    format === "image/jxl" ||
    format === "image/qoi"
  ) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const blob = await encodeWithAdvancedCodec(imageData, format, quality);
    if (!blob) throw new ImageConversionError("conversion-failed");
    return blob;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new ImageConversionError("conversion-failed")),
      format,
      format === "image/png" ? undefined : quality,
    );
  });
}
