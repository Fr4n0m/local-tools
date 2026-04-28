import { describe, expect, it } from "vitest";

import {
  isSvgContentValid,
  toPngName,
  toSvgDataUrl,
  toSvgName,
} from "@/modules/svg-to-file/domain/svg-file";

describe("svg-file helpers", () => {
  it("validates svg envelope", () => {
    expect(isSvgContentValid("<svg></svg>")).toBe(true);
    expect(isSvgContentValid("<div></div>")).toBe(false);
    expect(isSvgContentValid("<svg>")).toBe(false);
  });

  it("builds names with expected extension", () => {
    expect(toPngName("icon.svg")).toBe("icon.png");
    expect(toSvgName("icon.png")).toBe("icon.svg");
  });

  it("creates data url", () => {
    const result = toSvgDataUrl("<svg></svg>");
    expect(result.startsWith("data:image/svg+xml")).toBe(true);
  });
});
