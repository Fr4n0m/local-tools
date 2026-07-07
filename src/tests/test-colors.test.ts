import { describe, expect, it } from "vitest";

import {
  buildColorPairs,
  parseColorList,
  sortColorPairsByRatio,
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

describe("sortColorPairsByRatio", () => {
  it("sorts weakest and strongest correctly", () => {
    const rows = [
      { ratio: 8, id: "high" },
      { ratio: 2, id: "low" },
      { ratio: 4.5, id: "mid" },
    ];

    expect(sortColorPairsByRatio(rows, "weakest").map((row) => row.id)).toEqual(
      ["low", "mid", "high"],
    );
    expect(
      sortColorPairsByRatio(rows, "strongest").map((row) => row.id),
    ).toEqual(["high", "mid", "low"]);
  });
});
