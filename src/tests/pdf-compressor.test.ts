import { describe, expect, it } from "vitest";

import {
  clampQuality,
  clampScale,
  compressedPdfName,
} from "@/modules/pdf-compressor/domain/pdf-compressor";

describe("pdf compressor domain", () => {
  it("clamps scale and quality", () => {
    expect(clampScale(0)).toBe(0.3);
    expect(clampScale(2)).toBe(1);
    expect(clampQuality(0)).toBe(0.3);
    expect(clampQuality(1)).toBe(0.95);
  });

  it("builds output filename", () => {
    expect(compressedPdfName("file.pdf")).toBe("file-compressed.pdf");
  });
});
