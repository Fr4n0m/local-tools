import { describe, expect, it } from "vitest";

import {
  formatUuidValue,
  generateNilUuid,
  generateUuidV7,
  generateUuids,
  normalizeUuidAmount,
} from "@/modules/uuid-generator/domain/generate-uuids";
import { generateUuidsUseCase } from "@/modules/uuid-generator/application/generate-uuids-use-case";

describe("uuid generator", () => {
  it("normalizes invalid amounts", () => {
    expect(normalizeUuidAmount(Number.NaN)).toBe(1);
    expect(normalizeUuidAmount(-20)).toBe(1);
    expect(normalizeUuidAmount(999)).toBe(100);
    expect(normalizeUuidAmount(4.8)).toBe(4);
  });

  it("generates normalized amount of uuids", () => {
    const values = generateUuids(3);

    expect(values).toHaveLength(3);
    values.forEach((value) => {
      expect(value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  it("strips hyphens when requested", () => {
    const source = "123e4567-e89b-12d3-a456-426614174000";
    expect(formatUuidValue(source, true)).toBe(
      "123e4567e89b12d3a456426614174000",
    );
    expect(formatUuidValue(source, false)).toBe(source);
  });

  it("can uppercase formatted uuids", () => {
    const source = "123e4567-e89b-12d3-a456-426614174000";
    expect(formatUuidValue(source, false, true)).toBe(
      "123E4567-E89B-12D3-A456-426614174000",
    );
  });

  it("use case can generate uuid without hyphens", () => {
    const values = generateUuidsUseCase(2, { stripHyphens: true });

    expect(values).toHaveLength(2);
    values.forEach((value) => {
      expect(value).toMatch(/^[0-9a-f]{32}$/i);
    });
  });

  it("generates nil uuid", () => {
    expect(generateNilUuid()).toBe("00000000-0000-0000-0000-000000000000");
  });

  it("generates version 7 uuid", () => {
    const value = generateUuidV7();

    expect(value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
