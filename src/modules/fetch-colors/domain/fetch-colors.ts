import { z } from "zod";

export type PaletteColor = {
  hex: string;
  count: number;
};

export type PaletteColorWithShare = PaletteColor & {
  share: number;
};

const maxColorsSchema = z.coerce.number().int().min(1).max(16).catch(8);

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}

function quantizeChannel(value: number): number {
  return Math.round(value / 32) * 32;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function extractPalette(
  rgba: Uint8ClampedArray,
  maxColors = 8,
): PaletteColor[] {
  const safeMaxColors = maxColorsSchema.parse(maxColors);
  const map = new Map<string, number>();

  for (let i = 0; i < rgba.length; i += 4) {
    const alpha = rgba[i + 3];
    if (alpha < 200) continue;

    const r = quantizeChannel(rgba[i]);
    const g = quantizeChannel(rgba[i + 1]);
    const b = quantizeChannel(rgba[i + 2]);
    const key = rgbToHex(r, g, b);

    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, safeMaxColors);
}

export function withPaletteShare(
  colors: PaletteColor[],
): PaletteColorWithShare[] {
  const total = colors.reduce((sum, item) => sum + item.count, 0);
  if (total <= 0) {
    return colors.map((item) => ({ ...item, share: 0 }));
  }

  return colors.map((item) => ({
    ...item,
    share: Number(((item.count / total) * 100).toFixed(1)),
  }));
}

export function paletteToCssVariables(
  colors: PaletteColor[],
  prefix = "palette",
): string {
  const tokenName =
    prefix
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "palette";

  return colors
    .map((item, index) => `--${tokenName}-${index + 1}: ${item.hex};`)
    .join("\n");
}
