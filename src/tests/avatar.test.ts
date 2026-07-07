import { describe, expect, it } from "vitest";

import {
  avatarSeedColor,
  buildAvatarSvg,
  initialsFromName,
} from "@/modules/avatar-generator/domain/avatar";

describe("avatar generator domain", () => {
  it("builds initials from name", () => {
    expect(initialsFromName("Local Tools")).toBe("LT");
    expect(initialsFromName("")).toBe("LT");
  });

  it("returns stable seed color", () => {
    expect(avatarSeedColor("Local Tools")).toContain("hsl(");
    expect(avatarSeedColor("Local Tools")).toBe(avatarSeedColor("Local Tools"));
  });

  it("builds svg with clamped validated size", () => {
    const svg = buildAvatarSvg({
      size: 300,
      initials: "LT",
      background: "#000000",
      textColor: "#ffffff",
      shape: "rounded",
    });

    expect(svg).toContain('width="300"');
    expect(svg).toContain('fill="#000000"');
  });

  it("throws for invalid colors", () => {
    expect(() =>
      buildAvatarSvg({
        size: 300,
        initials: "LT",
        background: "bad-color",
        textColor: "#ffffff",
        shape: "rounded",
      }),
    ).toThrow();
  });
});
