import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtools.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${appUrl}/tools`,
      lastModified: new Date("2026-05-27"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${appUrl}/tools/favicon-generator`,
      lastModified: new Date("2026-07-14"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${appUrl}/privacy`,
      lastModified: new Date("2026-05-26"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${appUrl}/terms`,
      lastModified: new Date("2026-05-26"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
