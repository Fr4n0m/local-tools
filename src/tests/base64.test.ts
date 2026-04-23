import { describe, expect, it } from "vitest";

import { base64UseCase } from "@/modules/base64-tool/application/base64-use-case";

describe("base64UseCase", () => {
  it("encodes and decodes utf-8", () => {
    const encoded = base64UseCase.encode("hola ñ");
    const decoded = base64UseCase.decode(encoded);

    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value).toBe("hola ñ");
    }
  });

  it("handles invalid input", () => {
    expect(base64UseCase.decode("%%%").ok).toBe(false);
  });
});
