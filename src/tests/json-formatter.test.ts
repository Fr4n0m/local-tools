import { describe, expect, it } from "vitest";

import { formatJsonUseCase } from "@/modules/json-formatter/application/format-json-use-case";

describe("formatJsonUseCase", () => {
  it("formats valid JSON", () => {
    const result = formatJsonUseCase('{"a":1}');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('"a": 1');
    }
  });

  it("fails for invalid JSON", () => {
    const result = formatJsonUseCase('{"a":}');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.line).toBe(1);
      expect(result.error.column).toBe(6);
      expect(result.error.position).toBe(5);
    }
  });
});
