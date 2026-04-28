import { describe, expect, it } from "vitest";

import { buildLlmsTxt } from "@/modules/llms-txt/domain/llms-txt";

describe("llms txt builder", () => {
  it("builds sections and rules", () => {
    const output = buildLlmsTxt({
      projectName: "LocalTools",
      projectUrl: "https://example.com",
      summary: "Toolbox",
      docsUrl: "https://example.com/docs",
      sourceUrl: "https://example.com/src",
      license: "MIT",
      rules: "Use docs first\nPrefer local tools",
    });

    expect(output).toContain("# LocalTools");
    expect(output).toContain("## Links");
    expect(output).toContain("- Project: https://example.com");
    expect(output).toContain("## Guidance");
    expect(output).toContain("- Use docs first");
  });
});
