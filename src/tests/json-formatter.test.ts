import { describe, expect, it } from "vitest";

import { formatJsonUseCase } from "@/modules/json-formatter/application/format-json-use-case";
import {
  repairJson,
  resolveJsonPath,
} from "@/modules/json-formatter/domain/format-json";

describe("formatJsonUseCase", () => {
  it("formats valid JSON", () => {
    const result = formatJsonUseCase('{"a":1}');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('"a": 1');
    }
  });

  it("minifies output", () => {
    const result = formatJsonUseCase('{"a":1,"b":2}', { minify: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('{"a":1,"b":2}');
    }
  });

  it("sorts keys recursively", () => {
    const result = formatJsonUseCase('{"z":1,"a":{"d":2,"b":1}}', {
      sortKeys: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('"a": {');
      expect(result.value.indexOf('"a"')).toBeLessThan(
        result.value.indexOf('"z"'),
      );
      expect(result.value.indexOf('"b"')).toBeLessThan(
        result.value.indexOf('"d"'),
      );
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

  it("can repair comments and trailing commas", () => {
    const result = repairJson('{\n // comment\n "a": 1,\n}');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('"a": 1');
    }
  });

  it("resolves simple json path", () => {
    const result = resolveJsonPath('{"a":{"b":[{"c":1}]}}', "$.a.b[0].c");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("1");
    }
  });
});
