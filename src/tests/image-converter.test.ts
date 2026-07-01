import { describe, expect, it, vi } from "vitest";
import {
  convertImageFile,
  convertedFileName,
  extensionForFormat,
  ImageConversionError,
} from "@/modules/image-converter/domain/image-converter";

function fixture(options?: { context?: boolean; blob?: Blob | null }) {
  const fillRect = vi.fn();
  const drawImage = vi.fn();
  const toBlob = vi.fn((cb: BlobCallback, type?: string) =>
    cb(options?.blob === undefined ? new Blob([], { type }) : options.blob),
  );
  const context =
    options?.context === false
      ? null
      : ({ fillRect, drawImage } as unknown as CanvasRenderingContext2D);
  const canvas = {
    width: 10,
    height: 20,
    getContext: vi.fn(() => context),
    toBlob,
  } as unknown as HTMLCanvasElement;
  const image = { width: 10, height: 20 } as unknown as CanvasImageSource & {
    width: number;
    height: number;
  };
  return {
    browser: {
      loadImage: vi.fn(async () => image),
      createCanvas: vi.fn(() => canvas),
    },
    fillRect,
    toBlob,
  };
}

describe("image converter domain", () => {
  it("maps formats and replaces extensions", () => {
    expect(extensionForFormat["image/jpeg"]).toBe("jpg");
    expect(convertedFileName("photo.png", "image/jpeg")).toBe(
      "photo-converted.jpg",
    );
    expect(convertedFileName("archive", "image/webp", "")).toBe("archive.webp");
  });
  it("fills JPEG transparency white and forwards quality", async () => {
    const f = fixture();
    await convertImageFile(
      new File([], "x.png"),
      "image/jpeg",
      0.75,
      f.browser,
    );
    expect(f.fillRect).toHaveBeenCalledWith(0, 0, 10, 20);
    expect(f.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      "image/jpeg",
      0.75,
    );
  });
  it("omits quality for PNG", async () => {
    const f = fixture();
    await convertImageFile(new File([], "x.jpg"), "image/png", 0.2, f.browser);
    expect(f.fillRect).not.toHaveBeenCalled();
    expect(f.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      "image/png",
      undefined,
    );
  });
  it("returns typed boundary failures", async () => {
    const noContext = fixture({ context: false });
    await expect(
      convertImageFile(
        new File([], "x.png"),
        "image/png",
        1,
        noContext.browser,
      ),
    ).rejects.toMatchObject({ code: "canvas-unavailable" });
    const noBlob = fixture({ blob: null });
    await expect(
      convertImageFile(new File([], "x.png"), "image/png", 1, noBlob.browser),
    ).rejects.toBeInstanceOf(ImageConversionError);
  });
});
