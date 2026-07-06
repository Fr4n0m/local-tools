import { describe, expect, it } from "vitest";

import {
  buildBrowserConfigContent,
  buildFaviconPackage,
  buildHtmlSnippet,
  buildManifestContent,
  faviconFileName,
  normalizeAppName,
  normalizeShortName,
} from "@/modules/favicon-generator/domain/favicon-generator";

function createPngBlob(size: number) {
  return new Blob([new Uint8Array([137, 80, 78, 71, size])], {
    type: "image/png",
  });
}

const icons = [16, 32, 48, 150, 180, 192, 512].map((size) => ({
  size,
  fileName: faviconFileName(size),
  blob: createPngBlob(size),
}));

describe("favicon-generator domain", () => {
  it("normalizes app and short names", () => {
    expect(normalizeAppName("   My   App   ")).toBe("My App");
    expect(normalizeAppName("   ")).toBe("LocalTools");
    expect(normalizeShortName("", "My App Name")).toBe("My App Name");
    expect(normalizeShortName("   Short   App  ", "Fallback")).toBe(
      "Short App",
    );
  });

  it("maps canonical favicon file names", () => {
    expect(faviconFileName(16)).toBe("favicon-16x16.png");
    expect(faviconFileName(180)).toBe("apple-touch-icon.png");
    expect(faviconFileName(192)).toBe("android-chrome-192x192.png");
    expect(faviconFileName(512)).toBe("android-chrome-512x512.png");
  });

  it("builds manifest with app metadata and large icons", () => {
    const manifest = JSON.parse(
      buildManifestContent(icons, {
        appName: "Local Tools",
        shortName: "LT",
        themeColor: "#101010",
        backgroundColor: "#fafafa",
      }),
    );

    expect(manifest.name).toBe("Local Tools");
    expect(manifest.short_name).toBe("LT");
    expect(manifest.theme_color).toBe("#101010");
    expect(manifest.background_color).toBe("#fafafa");
    expect(manifest.icons).toEqual([
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ]);
  });

  it("builds browserconfig and html snippet", () => {
    const browserConfig = buildBrowserConfigContent(icons, {
      appName: "Local Tools",
      shortName: "LT",
      themeColor: "#101010",
      backgroundColor: "#fafafa",
    });
    const snippet = buildHtmlSnippet(icons, {
      appName: "Local Tools",
      shortName: "LT",
      themeColor: "#101010",
      backgroundColor: "#fafafa",
    });

    expect(browserConfig).toContain("/favicon-150x150.png");
    expect(browserConfig).toContain("<TileColor>#fafafa</TileColor>");
    expect(snippet).toContain('href="/favicon.ico"');
    expect(snippet).toContain('href="/apple-touch-icon.png"');
    expect(snippet).toContain('content="#101010"');
  });

  it("builds package files including ico and support files", async () => {
    const files = await buildFaviconPackage(icons, {
      appName: "Local Tools",
      shortName: "LT",
      themeColor: "#101010",
      backgroundColor: "#fafafa",
    });

    expect(files.map((file) => file.name)).toEqual(
      expect.arrayContaining([
        "favicon.ico",
        "site.webmanifest",
        "browserconfig.xml",
        "favicon-snippet.html",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
      ]),
    );
  });
});
