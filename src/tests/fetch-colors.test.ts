import { describe, expect, it } from "vitest";

import {
  extractPalette,
  rgbToHex,
} from "@/modules/fetch-colors/domain/fetch-colors";

describe("fetch colors domain", () => {
  it("converts rgb to hex", () => {
    expect(rgbToHex(255, 0, 16)).toBe("#ff0010");
  });

  it("extracts palette from pixels", () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255,
    ]);
    const palette = extractPalette(data, 2);
    expect(palette).toHaveLength(2);
    expect(palette[0].count).toBeGreaterThanOrEqual(palette[1].count);
  });
});
