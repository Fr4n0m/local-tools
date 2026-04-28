import { describe, expect, it } from "vitest";

import { buildPromptJson } from "@/modules/json-prompt-composer/domain/prompt-composer";

describe("json prompt composer domain", () => {
  it("builds valid json payload", () => {
    const output = buildPromptJson({
      role: "r",
      goal: "g",
      context: "c",
      constraints: "a\nb",
      outputFormat: "o",
    });

    const parsed = JSON.parse(output) as {
      constraints: string[];
      role: string;
    };

    expect(parsed.role).toBe("r");
    expect(parsed.constraints).toEqual(["a", "b"]);
  });
});
