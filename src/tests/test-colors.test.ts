import { describe, expect, it } from "vitest";

import {
  buildColorPairs,
  parseColorList,
} from "@/modules/test-colors/domain/test-colors";

describe("parseColorList", () => {
  it("normalizes, validates and deduplicates", () => {
    const result = parseColorList("#fff\n000000\n#fff\ninvalid");
    expect(result).toEqual(["#fff", "#000000"]);
  });
});

describe("buildColorPairs", () => {
  it("builds non-self foreground/background combinations", () => {
    const pairs = buildColorPairs(["#111111", "#222222", "#333333"]);
    expect(pairs).toHaveLength(6);
    expect(pairs.some((item) => item.foreground === item.background)).toBe(
      false,
    );
  });
});
