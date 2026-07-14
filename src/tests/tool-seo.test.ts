import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import {
  generateMetadata,
  generateStaticParams,
} from "@/app/tools/[toolId]/page";

describe("tool SEO", () => {
  it("publishes a dedicated canonical favicon generator page", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ toolId: "favicon-generator" }),
    });

    expect(metadata.title).toBe("Free Favicon Generator: ICO, PNG & App Icons");
    expect(metadata.alternates).toEqual({
      canonical: "/tools/favicon-generator",
    });
    expect(metadata.description).toContain("complete favicon package");
    expect(metadata.openGraph).toMatchObject({
      url: "https://localtools.app/tools/favicon-generator",
    });
  });

  it("only pre-renders available tools and lists their canonical URLs", () => {
    expect(generateStaticParams()).toContainEqual({
      toolId: "favicon-generator",
    });
    expect(sitemap()).toContainEqual(
      expect.objectContaining({
        url: "https://localtools.app/tools/favicon-generator",
      }),
    );
  });
});
