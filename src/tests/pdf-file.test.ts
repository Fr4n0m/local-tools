import { describe, expect, it } from "vitest";

import {
  clampScale,
  toPageImageName,
} from "@/modules/pdf-to-images/domain/pdf-file";

describe("pdf-file helpers", () => {
  it("clamps scale", () => {
    expect(clampScale(0)).toBe(1);
    expect(clampScale(2)).toBe(2);
    expect(clampScale(9)).toBe(3);
  });

  it("builds page names", () => {
    expect(toPageImageName("doc.pdf", 1)).toBe("doc-page-001.png");
  });
});
