import { describe, expect, it } from "vitest";

import {
  avatarSeedColor,
  buildAvatarSvg,
  fictitiousProfile,
  initialsFromName,
} from "@/modules/avatar-generator/domain/avatar";

describe("avatar generator domain", () => {
  it("builds initials from name", () => {
    expect(initialsFromName("Local Tools")).toBe("LT");
    expect(initialsFromName("")).toBe("LT");
  });

  it("returns stable seed color", () => {
    expect(avatarSeedColor("Local Tools")).toMatch(/^#[0-9a-f]{6}$/);
    expect(avatarSeedColor("Local Tools")).toBe(avatarSeedColor("Local Tools"));
  });

  it("creates local fictitious profiles without immediate repetition", () => {
    const first = fictitiousProfile(1, "female", "young");
    const second = fictitiousProfile(2, "female", "young");

    expect(first.name).not.toBe(second.name);
    expect(fictitiousProfile(1, "female", "young")).toEqual(first);
    expect(fictitiousProfile(1, "male", "young").name).not.toBe(first.name);
  });

  it("builds an illustrated portrait from local vector primitives", () => {
    const svg = buildAvatarSvg({
      size: 256,
      initials: "LT",
      background: "#f0f0f0",
      textColor: "#111111",
      shape: "circle",
      style: "portrait",
      hair: "bun",
      eyes: "wink",
      mouth: "open",
      skinColor: "#f2b38f",
      hairColor: "#38251f",
      shirtColor: "#6857e5",
    });

    expect(svg).toContain('clip-path="url(#avatar-frame)"');
    expect(svg).toContain('fill="#6857e5"');
    expect(svg).not.toContain("<image");
  });

  it("renders visible older-age details without external assets", () => {
    const svg = buildAvatarSvg({
      size: 256,
      initials: "LT",
      background: "#f0f0f0",
      textColor: "#111111",
      shape: "circle",
      style: "portrait",
      age: "elderly",
      presentation: "male",
      hair: "short",
      skinColor: "#f2b38f",
      hairColor: "#38251f",
      shirtColor: "#6857e5",
    });

    expect(svg).toContain('fill="#a7a7a7"');
    expect(svg).toContain('opacity=".7"');
  });

  it("escapes initials before inserting them into SVG", () => {
    const svg = buildAvatarSvg({
      size: 256,
      initials: "<&",
      background: "#000000",
      textColor: "#ffffff",
      shape: "rounded",
      style: "initials",
    });

    expect(svg).toContain("&lt;&amp;");
    expect(svg).not.toContain("><&</text>");
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
