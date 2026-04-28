export type PaletteColor = {
  hex: string;
  count: number;
};

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
    .slice(0, Math.max(1, Math.min(16, maxColors)));
}
