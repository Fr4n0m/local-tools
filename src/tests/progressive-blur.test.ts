import { describe, expect, it } from "vitest";

import {
  buildProgressiveBlurCss,
  clampBlur,
} from "@/modules/progressive-blur/domain/progressive-blur";

describe("progressive blur domain", () => {
  it("clamps blur value", () => {
    expect(clampBlur(0)).toBe(2);
    expect(clampBlur(100)).toBe(80);
  });

  it("builds css", () => {
    expect(buildProgressiveBlurCss(24, 4)).toContain("backdrop-filter");
  });
});
