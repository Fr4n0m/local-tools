import { describe, expect, it } from "vitest";

import { computeContrastUseCase } from "@/modules/contrast-checker/application/compute-contrast-use-case";
import { computeContrast } from "@/modules/contrast-checker/domain/contrast";

describe("contrast checker", () => {
  it("computes high contrast for black on white", () => {
    const result = computeContrast("#000000", "#ffffff");
    expect(result).not.toBeNull();
    expect(result?.ratio).toBeGreaterThan(20);
    expect(result?.aaNormal).toBe(true);
    expect(result?.aaaNormal).toBe(true);
  });

  it("returns null for invalid hex", () => {
    expect(computeContrast("#invalid", "#ffffff")).toBeNull();
  });

  it("use-case returns error for invalid color", () => {
    expect(computeContrastUseCase("#invalid", "#ffffff")).toEqual({
      ok: false,
      error: "invalid_color",
    });
  });
});
