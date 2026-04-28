import { describe, expect, it } from "vitest";

import {
  estimateReadMinutes,
  splitParagraphs,
} from "@/modules/focus-reader/domain/focus-reader";

describe("focus reader domain", () => {
  it("splits paragraphs", () => {
    const parts = splitParagraphs("One\n\nTwo");
    expect(parts).toEqual(["One", "Two"]);
  });

  it("estimates reading time", () => {
    expect(estimateReadMinutes("")).toBe(0);
    expect(estimateReadMinutes("word ".repeat(221))).toBe(2);
  });
});
