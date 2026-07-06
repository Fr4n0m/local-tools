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

  it("removes all spaces", () => {
    expect(textTransformerUseCase.removeSpaces(" a  b\n c ")).toBe("abc");
  });

  it("normalizes spaces", () => {
    expect(textTransformerUseCase.normalizeSpaces(" a  b\n c ")).toBe("a b c");
  });

  it("slugifies text", () => {
    expect(textTransformerUseCase.slugify("  Hola, Mundo Ñ  ")).toBe(
      "hola-mundo-n",
    );
  });

  it("builds camel and pascal case", () => {
    expect(textTransformerUseCase.camelCase("hola mundo test")).toBe(
      "holaMundoTest",
    );
    expect(textTransformerUseCase.pascalCase("hola mundo test")).toBe(
      "HolaMundoTest",
    );
  });

  it("builds snake kebab and constant case", () => {
    expect(textTransformerUseCase.snakeCase("hola mundo test")).toBe(
      "hola_mundo_test",
    );
    expect(textTransformerUseCase.kebabCase("hola mundo test")).toBe(
      "hola-mundo-test",
    );
    expect(textTransformerUseCase.constantCase("hola mundo test")).toBe(
      "HOLA_MUNDO_TEST",
    );
  });
});
