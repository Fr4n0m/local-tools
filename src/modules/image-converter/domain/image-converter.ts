export type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

export type ConversionErrorCode =
  | "image-load-error"
  | "canvas-unavailable"
  | "conversion-failed";

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

export async function convertImageFile(
  file: File,
  format: OutputFormat,
  quality: number,
  browser: ConversionBrowser = defaultBrowser,
): Promise<Blob> {
  let image: DrawableImage;
  try {
    image = await browser.loadImage(file);
  } catch (error) {
    if (error instanceof ImageConversionError) throw error;
    throw new ImageConversionError("image-load-error");
  }
  const canvas = browser.createCanvas(image.width, image.height);
  const context = canvas.getContext("2d");
  if (!context) throw new ImageConversionError("canvas-unavailable");
  if (format === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0);
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
