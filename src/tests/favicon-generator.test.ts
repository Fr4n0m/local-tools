import { describe, expect, it } from "vitest";

import {
  buildBrowserConfigContent,
  buildFaviconPackage,
  buildHtmlSnippet,
  buildManifestContent,
  createDefaultFaviconRenderSettings,
  drawFaviconSource,
  FAVICON_CORNER_SHAPES,
  faviconFileName,
  normalizeAppName,
  normalizeFaviconPath,
  normalizeShortName,
  normalizeVersionTag,
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
  it("offers the six corner shapes with round as the generic default", () => {
    expect(FAVICON_CORNER_SHAPES).toEqual([
      "square",
      "round",
      "squircle",
      "bevel",
      "scoop",
      "notch",
    ]);
    expect(createDefaultFaviconRenderSettings().cornerShape).toBe("round");
  });

  it("renders every corner shape as a distinct canvas clipping path", () => {
    const expectedPathCommand = {
      square: "rect",
      round: "arcTo",
      squircle: "bezierCurveTo",
      bevel: "lineTo",
      scoop: "quadraticCurveTo",
      notch: "lineTo",
    } as const;

    for (const cornerShape of FAVICON_CORNER_SHAPES) {
      const commands: string[] = [];
      const context = new Proxy(
        {},
        {
          get: (_target, property) => {
            if (property === "canvas") return { width: 96, height: 96 };
            return () => commands.push(String(property));
          },
          set: () => true,
        },
      ) as CanvasRenderingContext2D;

      drawFaviconSource(context, {} as CanvasImageSource, 96, 96, 96, {
        ...createDefaultFaviconRenderSettings(),
        cornerShape,
        fit: "stretch",
        roundness: 0.5,
      });

      expect(commands).toContain("clip");
      expect(commands).toContain(expectedPathCommand[cornerShape]);
    }
  });

  it("normalizes app and short names", () => {
    expect(normalizeAppName("   My   App   ")).toBe("My App");
    expect(normalizeAppName("   ")).toBe("LocalTools");
    expect(normalizeShortName("", "My App Name")).toBe("My App Name");
    expect(normalizeShortName("   Short   App  ", "Fallback")).toBe(
      "Short App",
    );
    expect(normalizeFaviconPath("assets/favicons")).toBe("/assets/favicons/");
    expect(normalizeFaviconPath("/")).toBe("/");
    expect(normalizeVersionTag("  july 2026  ")).toBe("july-2026");
  });

  it("makes favicon paths safe for generated HTML, XML, and JSON", () => {
    const unsafePath = '/assets/../favicons/\" onload=\"alert(1)/';
    const normalized = normalizeFaviconPath(unsafePath);
    const snippet = buildHtmlSnippet(icons, {
      appName: "Safe app",
      faviconPath: unsafePath,
      themeColor: "#111111",
      backgroundColor: "#ffffff",
    });
    const browserConfig = buildBrowserConfigContent(icons, {
      appName: "Safe app",
      faviconPath: unsafePath,
      themeColor: "#111111",
      backgroundColor: "#ffffff",
    });

    expect(normalized).toBe("/assets/favicons/%22%20onload%3D%22alert(1)/");
    expect(snippet).not.toContain('" onload="');
    expect(browserConfig).not.toContain('" onload="');
    expect(snippet).toContain(
      'href="/assets/favicons/%22%20onload%3D%22alert(1)/favicon.ico"',
    );
  });

  it("maps canonical favicon file names", () => {
    expect(faviconFileName(16)).toBe("favicon-16x16.png");
    expect(faviconFileName(16, "dark")).toBe("favicon-dark-16x16.png");
    expect(faviconFileName(180)).toBe("apple-touch-icon.png");
    expect(faviconFileName(180, "dark")).toBe("apple-touch-icon-dark.png");
    expect(faviconFileName(192)).toBe("android-chrome-192x192.png");
    expect(faviconFileName(512)).toBe("android-chrome-512x512.png");
  });

  it("builds manifest with app metadata and large icons", () => {
    const manifestIcons = [
      ...icons,
      ...[192, 512].map((size) => ({
        size,
        fileName: `android-chrome-maskable-${size}x${size}.png`,
        blob: createPngBlob(size),
      })),
    ];
    const manifest = JSON.parse(
      buildManifestContent(manifestIcons, {
        appName: "Local Tools",
        shortName: "LT",
        themeColor: "#101010",
        backgroundColor: "#fafafa",
        faviconPath: "/favicons/",
        version: "2026-07",
      }),
    );

    expect(manifest.name).toBe("Local Tools");
    expect(manifest.short_name).toBe("LT");
    expect(manifest.theme_color).toBe("#101010");
    expect(manifest.background_color).toBe("#fafafa");
    expect(manifest.icons).toEqual([
      {
        src: "/favicons/android-chrome-192x192.png?v=2026-07",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicons/android-chrome-512x512.png?v=2026-07",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicons/android-chrome-maskable-192x192.png?v=2026-07",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicons/android-chrome-maskable-512x512.png?v=2026-07",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ]);
  });

  it("uses android-specific metadata and dark android icons when configured", () => {
    const darkIcons = [192, 512].map((size) => ({
      size,
      fileName: faviconFileName(size, "dark"),
      blob: createPngBlob(size),
    }));

    const manifest = JSON.parse(
      buildManifestContent(
        icons,
        {
          appName: "Local Tools",
          shortName: "LT",
          androidAppName: "Android Tools",
          androidShortName: "AT",
          androidIconVariant: "dark",
          themeColor: "#101010",
          backgroundColor: "#fafafa",
        },
        darkIcons,
      ),
    );

    expect(manifest.name).toBe("Android Tools");
    expect(manifest.short_name).toBe("AT");
    expect(manifest.icons[0].src).toBe("/android-chrome-dark-192x192.png");
    expect(manifest.icons[1].src).toBe("/android-chrome-dark-512x512.png");
  });

  it("builds browserconfig and html snippet with dark variants", () => {
    const darkIcons = [16, 32, 180].map((size) => ({
      size,
      fileName: faviconFileName(size, "dark"),
      blob: createPngBlob(size),
    }));
    const browserConfig = buildBrowserConfigContent(icons, {
      appName: "Local Tools",
      shortName: "LT",
      themeColor: "#101010",
      backgroundColor: "#fafafa",
      faviconPath: "/favicons/",
      version: "cache-bust",
    });
    const snippet = buildHtmlSnippet(
      icons,
      {
        appName: "Local Tools",
        shortName: "LT",
        themeColor: "#101010",
        backgroundColor: "#fafafa",
        faviconPath: "/favicons/",
        version: "cache-bust",
      },
      darkIcons,
    );

    expect(browserConfig).toContain(
      "/favicons/favicon-150x150.png?v=cache-bust",
    );
    expect(browserConfig).toContain("<TileColor>#fafafa</TileColor>");
    expect(snippet).toContain('href="/favicons/favicon.ico?v=cache-bust"');
    expect(snippet).toContain(
      'href="/favicons/apple-touch-icon.png?v=cache-bust"',
    );
    expect(snippet).toContain(
      'href="/favicons/favicon-dark-16x16.png?v=cache-bust" media="(prefers-color-scheme: dark)"',
    );
    expect(snippet).toContain(
      'href="/favicons/apple-touch-icon-dark.png?v=cache-bust" media="(prefers-color-scheme: dark)"',
    );
    expect(snippet).toContain('content="#101010"');
  });

  it("uses dark apple touch icon as primary apple icon when configured", () => {
    const darkIcons = [16, 32, 180].map((size) => ({
      size,
      fileName: faviconFileName(size, "dark"),
      blob: createPngBlob(size),
    }));

    const snippet = buildHtmlSnippet(
      icons,
      {
        appName: "Local Tools",
        shortName: "LT",
        appleTouchIconVariant: "dark",
        themeColor: "#101010",
        backgroundColor: "#fafafa",
      },
      darkIcons,
    );

    expect(snippet).toContain('href="/apple-touch-icon-dark.png"');
  });

  it("builds package files including ico support files and dark assets", async () => {
    const darkIcons = [16, 32, 180].map((size) => ({
      size,
      fileName: faviconFileName(size, "dark"),
      blob: createPngBlob(size),
    }));
    const files = await buildFaviconPackage(
      icons,
      {
        appName: "Local Tools",
        shortName: "LT",
        themeColor: "#101010",
        backgroundColor: "#fafafa",
        faviconPath: "/favicons/",
        version: "v2",
      },
      darkIcons,
    );

    expect(files.map((file) => file.name)).toEqual(
      expect.arrayContaining([
        "favicon.ico",
        "site.webmanifest",
        "browserconfig.xml",
        "favicon-snippet.html",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "favicon-dark-16x16.png",
        "favicon-dark-32x32.png",
        "apple-touch-icon.png",
        "apple-touch-icon-dark.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
      ]),
    );
  });
});
