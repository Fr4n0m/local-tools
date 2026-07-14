import { afterEach, describe, expect, it, vi } from "vitest";

import {
  MAX_FAVICON_FILE_BYTES,
  validateFaviconImageFile,
} from "@/modules/favicon-generator/application/validate-favicon-image";

describe("favicon image validation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rejects files larger than the local processing budget", async () => {
    const file = new File(
      [new Uint8Array(MAX_FAVICON_FILE_BYTES + 1)],
      "huge.png",
      {
        type: "image/png",
      },
    );

    await expect(validateFaviconImageFile(file)).resolves.toEqual({
      ok: false,
      error: "too-large",
    });
  });

  it("rejects spoofed image MIME types and unsafe SVG content", async () => {
    const spoofed = new File(["not a png"], "fake.png", {
      type: "image/png",
    });
    const unsafeSvg = new File(
      [
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      ],
      "unsafe.svg",
      { type: "image/svg+xml" },
    );

    await expect(validateFaviconImageFile(spoofed)).resolves.toEqual({
      ok: false,
      error: "unsupported-type",
    });
    await expect(validateFaviconImageFile(unsafeSvg)).resolves.toEqual({
      ok: false,
      error: "unsafe-svg",
    });
  });

  it("accepts decodable safe SVG files within the pixel budget", async () => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:safe-svg"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal(
      "Image",
      class MockImage {
        naturalWidth = 512;
        naturalHeight = 512;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        set src(_value: string) {
          queueMicrotask(() => this.onload?.());
        }
      },
    );
    const file = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"></svg>'],
      "safe.svg",
      { type: "image/svg+xml" },
    );

    await expect(validateFaviconImageFile(file)).resolves.toEqual({ ok: true });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:safe-svg");
  });
});
