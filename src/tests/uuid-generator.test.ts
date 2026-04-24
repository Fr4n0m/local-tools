import { describe, expect, it } from "vitest";

import {
  generateUuids,
  normalizeUuidAmount,
} from "@/modules/uuid-generator/domain/generate-uuids";

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
});
