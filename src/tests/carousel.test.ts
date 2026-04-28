import { describe, expect, it } from "vitest";

import {
  buildCarouselHtml,
  parseImageLines,
} from "@/modules/carousel-generator/domain/carousel";

describe("carousel domain", () => {
  it("parses valid http lines", () => {
    const urls = parseImageLines("https://a.com\ninvalid\nhttp://b.com");
    expect(urls).toEqual(["https://a.com", "http://b.com"]);
  });

  it("builds html with slides", () => {
    const html = buildCarouselHtml({
      imageUrls: ["https://a.com/1.jpg", "https://a.com/2.jpg"],
      autoplayMs: 3000,
      showDots: true,
    });
    expect(html).toContain("lt-carousel");
    expect(html).toContain("Slide 1");
  });
});
