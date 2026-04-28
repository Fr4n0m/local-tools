import { describe, expect, it } from "vitest";

import {
  generateColorRange,
  toCssVariables,
} from "@/modules/color-range/domain/color-range";

describe("generateColorRange", () => {
  it("returns expected step count", () => {
    const result = generateColorRange("#3b82f6", 9);
    expect(result).toHaveLength(9);
    expect(result[4].step).toBe(400);
  });

  it("clamps steps and rejects invalid color", () => {
    expect(generateColorRange("invalid", 9)).toEqual([]);
    expect(generateColorRange("#3b82f6", 1)).toHaveLength(3);
    expect(generateColorRange("#3b82f6", 99)).toHaveLength(11);
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
});
