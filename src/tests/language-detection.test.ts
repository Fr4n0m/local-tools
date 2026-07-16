import { describe, expect, it } from "vitest";
import {
  resolvePreferredLanguage,
  sharedMessages,
} from "@/shared/presentation/i18n";

function flattenCatalog(
  value: unknown,
  path = "",
  result: Record<string, unknown> = {},
) {
  if (Array.isArray(value)) {
    result[path] = value.length;
    value.forEach((item, index) =>
      flattenCatalog(item, `${path}.${index}`, result),
    );
    return result;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) =>
      flattenCatalog(child, path ? `${path}.${key}` : key, result),
    );
    return result;
  }
  result[path] = value;
  return result;
}

describe("global language detection", () => {
  it("keeps a supported explicit preference", () => {
    expect(resolvePreferredLanguage("en", "es-ES")).toBe("en");
    expect(resolvePreferredLanguage("es", "en-US")).toBe("es");
    expect(resolvePreferredLanguage("fr", "de-DE")).toBe("fr");
    expect(resolvePreferredLanguage("de", "it-IT")).toBe("de");
    expect(resolvePreferredLanguage("it", "fr-FR")).toBe("it");
  });

  it("uses the supported primary browser language without a preference", () => {
    expect(resolvePreferredLanguage(null, "es-ES")).toBe("es");
    expect(resolvePreferredLanguage(null, "en-GB")).toBe("en");
    expect(resolvePreferredLanguage(null, "fr-FR")).toBe("fr");
    expect(resolvePreferredLanguage(null, "de-DE")).toBe("de");
    expect(resolvePreferredLanguage(null, "it-IT")).toBe("it");
  });

  it("falls back to English for unsupported or missing languages", () => {
    expect(resolvePreferredLanguage(null, "pt-BR")).toBe("en");
    expect(resolvePreferredLanguage("invalid", null)).toBe("en");
  });
});

describe("shared translation catalogs", () => {
  it("keeps identical key and array structures in every language", () => {
    const english = flattenCatalog(sharedMessages.en);
    const englishKeys = Object.keys(english);

    for (const messages of Object.values(sharedMessages)) {
      expect(Object.keys(flattenCatalog(messages))).toEqual(englishKeys);
    }
  });

  it("preserves interpolation tokens", () => {
    const tokenPattern = /\{[^}]+\}/g;
    const english = flattenCatalog(sharedMessages.en);

    for (const messages of Object.values(sharedMessages)) {
      const translated = flattenCatalog(messages);
      for (const [key, value] of Object.entries(english)) {
        if (typeof value !== "string" || typeof translated[key] !== "string")
          continue;
        expect((translated[key] as string).match(tokenPattern) ?? []).toEqual(
          value.match(tokenPattern) ?? [],
        );
      }
    }
  });
});
