import { describe, expect, it } from "vitest";

import {
  buildLiquidGlassCss,
  clampGlassOpacity,
} from "@/modules/liquid-glass/domain/liquid-glass";

describe("liquid glass domain", () => {
  it("clamps opacity", () => {
    expect(clampGlassOpacity(0)).toBe(0.05);
    expect(clampGlassOpacity(1)).toBe(0.8);
  });

  it("builds css", () => {
    expect(buildLiquidGlassCss(0.3, 18)).toContain("backdrop-filter");
  });
});
