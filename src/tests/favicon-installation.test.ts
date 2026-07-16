import { describe, expect, it } from "vitest";

import { extractFaviconReferences } from "@/modules/favicon-generator/domain/favicon-checker";
import {
  buildAiInstallationPrompt,
  buildInstallationGuide,
  FAVICON_INTEGRATION_TARGETS,
} from "@/modules/favicon-generator/domain/favicon-installation";
import type { FaviconInstallationLanguage } from "@/modules/favicon-generator/domain/favicon-installation";

const htmlSnippet = [
  '<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />',
  '<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />',
  '<link rel="manifest" href="/icons/site.webmanifest" />',
  '<meta name="msapplication-config" content="/icons/browserconfig.xml" />',
].join("\n");

describe("favicon installation guidance", () => {
  const languages: readonly FaviconInstallationLanguage[] = [
    "de",
    "en",
    "es",
    "fr",
    "it",
  ];

  it.each(FAVICON_INTEGRATION_TARGETS)(
    "builds complete guidance for %s",
    (target) => {
      const guide = buildInstallationGuide({
        target,
        language: "en",
        htmlSnippet,
        faviconPath: "/icons/",
      });
      expect(guide).toContain("/icons/");
      expect(guide).toContain("site.webmanifest");
      expect(guide).not.toMatch(/\b(?:Añade|Copia|Conserva|Automatiza)\b/);
    },
  );

  it("builds a self-contained agent prompt without remote asset URLs", () => {
    const prompt = buildAiInstallationPrompt({
      target: "nextjs",
      language: "es",
      htmlSnippet,
      faviconPath: "/icons/",
    });
    expect(prompt).toContain("inspecciona el repositorio");
    expect(prompt).toContain("android-chrome-maskable-512x512.png");
    expect(prompt).not.toContain("realfavicongenerator.net/files");
  });

  it.each(languages)(
    "preserves paths, snippets and package files in the %s catalog",
    (language) => {
      const options = {
        target: "nextjs" as const,
        language,
        htmlSnippet,
        faviconPath: "/icons/",
      };

      const guide = buildInstallationGuide(options);
      const prompt = buildAiInstallationPrompt(options);

      expect(guide).toContain("`public/icons`");
      expect(guide).toContain("`src/app/layout.tsx`");
      for (const line of htmlSnippet.split("\n")) {
        expect(guide).toContain(line);
      }
      expect(prompt).toContain("favicon.ico");
      expect(prompt).toContain("android-chrome-maskable-512x512.png");
      expect(prompt).toContain(guide);
    },
  );
});

describe("favicon markup inspection", () => {
  it("extracts and classifies unique favicon references", () => {
    expect(extractFaviconReferences(`${htmlSnippet}\n${htmlSnippet}`)).toEqual([
      { href: "/icons/favicon-32x32.png", kind: "icon" },
      { href: "/icons/apple-touch-icon.png", kind: "apple" },
      { href: "/icons/site.webmanifest", kind: "manifest" },
      { href: "/icons/browserconfig.xml", kind: "config" },
    ]);
  });
});
