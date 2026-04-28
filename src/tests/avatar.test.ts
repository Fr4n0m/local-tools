import { describe, expect, it } from "vitest";

import {
  avatarSeedColor,
  buildAvatarSvg,
  initialsFromName,
} from "@/modules/avatar-generator/domain/avatar";

describe("avatar domain", () => {
  it("builds initials", () => {
    expect(initialsFromName("Fran Romero")).toBe("FR");
    expect(initialsFromName(" ")).toBe("LT");
  });

  it("returns deterministic seed color", () => {
    expect(avatarSeedColor("Local Tools")).toBe(avatarSeedColor("Local Tools"));
  });

  it("builds svg", () => {
    const svg = buildAvatarSvg({
      size: 256,
      initials: "LT",
      background: "#000000",
      textColor: "#ffffff",
      shape: "rounded",
    });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("LT");
  });
});
