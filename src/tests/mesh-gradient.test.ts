import { describe, expect, it } from "vitest";

import {
  buildMeshGradientCss,
  buildMeshGradientSvg,
  normalizeStops,
} from "@/modules/mesh-gradient/domain/mesh-gradient";

describe("mesh gradient domain", () => {
  it("normalizes stop coordinates", () => {
    const result = normalizeStops([{ color: "#fff", x: -20, y: 180 }]);
    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(100);
  });

  it("builds css and svg outputs", () => {
    const stops = [{ color: "#fff", x: 20, y: 30 }];
    expect(buildMeshGradientCss(stops)).toContain("radial-gradient");
    expect(buildMeshGradientSvg(stops)).toContain("<svg");
  });
});
