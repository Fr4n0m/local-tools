import { describe, expect, it } from "vitest";

import {
  extractPalette,
  paletteToCssVariables,
  rgbToHex,
  withPaletteShare,
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

  it("computes share percentages and css variables", () => {
    const palette = withPaletteShare([
      { hex: "#ff0000", count: 3 },
      { hex: "#00ff00", count: 1 },
    ]);

    expect(palette[0].share).toBe(75);
    expect(palette[1].share).toBe(25);
    expect(paletteToCssVariables(palette, "Brand Colors")).toContain(
      "--brand-colors-1: #ff0000;",
    );
  });

  it("clamps requested max colors", () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255,
    ]);
    expect(extractPalette(data, Number.NaN).length).toBeGreaterThan(0);
  });
});
