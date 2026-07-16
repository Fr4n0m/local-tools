import { describe, expect, it } from "vitest";

import de from "@/modules/favicon-generator/presentation/i18n/de.json";
import en from "@/modules/favicon-generator/presentation/i18n/en.json";
import es from "@/modules/favicon-generator/presentation/i18n/es.json";
import fr from "@/modules/favicon-generator/presentation/i18n/fr.json";
import itMessages from "@/modules/favicon-generator/presentation/i18n/it.json";
import {
  sharedMessages,
  SUPPORTED_LANGUAGES,
} from "@/shared/presentation/i18n";

type Catalog = Record<string, unknown>;

function flatten(value: Catalog, prefix = ""): Record<string, unknown> {
  return Object.entries(value).reduce<Record<string, unknown>>(
    (result, [key, entry]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        Object.assign(result, flatten(entry as Catalog, path));
      } else {
        result[path] = entry;
      }
      return result;
    },
    {},
  );
}

function tokens(value: unknown): string[] {
  return typeof value === "string"
    ? [...value.matchAll(/\{[^{}]+\}/g)].map(([token]) => token).sort()
    : [];
}

describe("five-language catalogs", () => {
  const faviconCatalogs = { de, en, es, fr, it: itMessages } as const;

  it("supports the five product languages", () => {
    expect(SUPPORTED_LANGUAGES).toEqual(["es", "en", "fr", "de", "it"]);
  });

  it.each(Object.entries(faviconCatalogs))(
    "keeps Favicon keys and interpolation tokens in %s",
    (_language, catalog) => {
      const reference = flatten(en);
      const candidate = flatten(catalog);
      expect(Object.keys(candidate).sort()).toEqual(
        Object.keys(reference).sort(),
      );
      for (const key of Object.keys(reference)) {
        expect(tokens(candidate[key]), key).toEqual(tokens(reference[key]));
      }
    },
  );

  it.each(Object.entries(sharedMessages))(
    "keeps shared-shell keys and interpolation tokens in %s",
    (_language, catalog) => {
      const reference = flatten(sharedMessages.en);
      const candidate = flatten(catalog);
      expect(Object.keys(candidate).sort()).toEqual(
        Object.keys(reference).sort(),
      );
      for (const key of Object.keys(reference)) {
        expect(tokens(candidate[key]), key).toEqual(tokens(reference[key]));
      }
    },
  );
});
