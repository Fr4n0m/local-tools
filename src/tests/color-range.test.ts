import { describe, expect, it } from "vitest";

import {
  generateColorRange,
  toCssVariables,
  toTailwindPalette,
} from "@/modules/color-range/domain/color-range";

describe("generateColorRange", () => {
  it("returns expected step count", () => {
    const result = generateColorRange("#3b82f6", 9);
    expect(result).toHaveLength(9);
    expect(result[4].step).toBe(400);
  });

  it("clamps steps and rejects invalid color", () => {
    expect(generateColorRange("invalid", 9)).toEqual([]);
    expect(generateColorRange("#fff", 9)).toHaveLength(9);
    expect(generateColorRange("#3b82f6", 1)).toHaveLength(3);
    expect(generateColorRange("#3b82f6", 99)).toHaveLength(11);
  });

  it("supports scale modes", () => {
    const tints = generateColorRange("#3b82f6", 5, "tints");
    const shades = generateColorRange("#3b82f6", 5, "shades");

    expect(tints).toHaveLength(5);
    expect(shades).toHaveLength(5);
    expect(tints.at(-1)?.hex).not.toBe(shades.at(-1)?.hex);
  });
});

describe("toCssVariables", () => {
  it("normalizes token name and prints variables", () => {
    const result = toCssVariables("Brand Primary", [
      { step: 50, hex: "#ffffff" },
      { step: 500, hex: "#3b82f6" },
    ]);
    expect(result).toContain("--brand-primary-50: #ffffff;");
    expect(result).toContain("--brand-primary-500: #3b82f6;");
  });

  it("prints a tailwind palette block", () => {
    const result = toTailwindPalette("Brand Primary", [
      { step: 50, hex: "#ffffff" },
      { step: 500, hex: "#3b82f6" },
    ]);

    expect(result).toContain("brand-primary: {");
    expect(result).toContain('500: "#3b82f6",');
  });
});
