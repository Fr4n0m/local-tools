import { describe, expect, it } from "vitest";
import { resolvePreferredLanguage } from "@/shared/presentation/i18n";

describe("global language detection", () => {
  it("keeps a supported explicit preference", () => {
    expect(resolvePreferredLanguage("en", "es-ES")).toBe("en");
    expect(resolvePreferredLanguage("es", "en-US")).toBe("es");
  });

  it("uses the supported primary browser language without a preference", () => {
    expect(resolvePreferredLanguage(null, "es-ES")).toBe("es");
    expect(resolvePreferredLanguage(null, "en-GB")).toBe("en");
  });

  it("falls back to English for unsupported or missing languages", () => {
    expect(resolvePreferredLanguage(null, "fr-FR")).toBe("en");
    expect(resolvePreferredLanguage("invalid", null)).toBe("en");
  });
});
