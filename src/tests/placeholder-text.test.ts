import { describe, expect, it } from "vitest";

import { generatePlaceholderUseCase } from "@/modules/placeholder-text/application/generate-placeholder-use-case";
import { generatePlaceholderText } from "@/modules/placeholder-text/domain/placeholder-text";

describe("placeholder text", () => {
  it("generates lorem paragraphs", () => {
    const output = generatePlaceholderText("lorem", 2, 2, 5);
    const paragraphs = output.split("\n\n");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].endsWith(".")).toBe(true);
  });

  it("clamps invalid numbers", () => {
    const output = generatePlaceholderText("cat", -1, 0, 1);
    expect(output.length).toBeGreaterThan(0);
    expect(output.includes(" ")).toBe(true);
  });

  it("use-case returns generated output", () => {
    const output = generatePlaceholderUseCase({
      mode: "english-ish",
      paragraphs: 1,
      sentencesPerParagraph: 1,
      wordsPerSentence: 6,
    });
    expect(output).toContain(".");
  });
});
