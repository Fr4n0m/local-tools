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
    const svg = buildMeshGradientSvg(stops, 1600, 900);
    expect(svg).toContain('viewBox="0 0 1600 900"');
    expect(svg).toContain('width="1600"');
    expect(svg).toContain('height="900"');
  });
});
