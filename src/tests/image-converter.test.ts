import { describe, expect, it, vi } from "vitest";

import { encodeAdvancedCodec } from "@/modules/image-converter/infrastructure/browser/advanced-codecs";
import {
  convertImageFile,
  convertedFileName,
  extensionForFormat,
  ImageConversionError,
} from "@/modules/image-converter/domain/image-converter";

vi.mock(
  "@/modules/image-converter/infrastructure/browser/advanced-codecs",
  () => ({
    encodeAdvancedCodec: vi.fn(),
  }),
);

const encodeAdvancedCodecMock = vi.mocked(encodeAdvancedCodec);

function fixture(options?: { context?: boolean; blob?: Blob | null }) {
  const fillRect = vi.fn();
  const drawImage = vi.fn();
  const imageData = {
    data: new Uint8ClampedArray(10 * 20 * 4),
    width: 10,
    height: 20,
  } as ImageData;
  const toBlob = vi.fn((cb: BlobCallback, type?: string) =>
    cb(options?.blob === undefined ? new Blob([], { type }) : options.blob),
  );
  const context =
    options?.context === false
      ? null
      : ({
          fillRect,
          drawImage,
          getImageData: vi.fn(() => imageData),
        } as unknown as CanvasRenderingContext2D);
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
      createCanvas: vi.fn((width: number, height: number) => {
        canvas.width = width;
        canvas.height = height;
        return canvas;
      }),
    },
    drawImage,
    fillRect,
    imageData,
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
    expect(f.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 10, 20);
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
  it.each([["image/avif"], ["image/jxl"], ["image/qoi"]] as const)(
    "delegates %s to the advanced codec adapter",
    async (format) => {
      const f = fixture();
      const blob = new Blob(["advanced"], { type: format });
      encodeAdvancedCodecMock.mockResolvedValueOnce(blob);

      const output = await convertImageFile(
        new File([], "x.png"),
        format,
        0.81,
        f.browser,
      );

      expect(output).toBe(blob);
      expect(encodeAdvancedCodecMock).toHaveBeenCalledWith(
        f.imageData,
        format,
        0.81,
      );
      expect(f.toBlob).not.toHaveBeenCalled();
    },
  );
  it("resizes output when custom dimensions are provided", async () => {
    const f = fixture();
    await convertImageFile(
      new File([], "x.jpg"),
      "image/webp",
      0.8,
      { width: 80, height: 40 },
      f.browser,
    );
    expect(f.browser.createCanvas).toHaveBeenCalledWith(80, 40);
    expect(f.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 80, 40);
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
