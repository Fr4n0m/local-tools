import { describe, expect, it } from "vitest";

import { textTransformerUseCase } from "@/modules/text-transformer/application/text-transformer-use-case";

describe("textTransformerUseCase", () => {
  it("uppercases text", () => {
    expect(textTransformerUseCase.uppercase("hola")).toBe("HOLA");
  });

  it("lowercases text", () => {
    expect(textTransformerUseCase.lowercase("HoLA")).toBe("hola");
  });

  it("capitalizes words", () => {
    expect(textTransformerUseCase.capitalize("hOLA mUNDO")).toBe("Hola Mundo");
  });

  it("trims edges", () => {
    expect(textTransformerUseCase.trim("  hi  ")).toBe("hi");
  });
});
