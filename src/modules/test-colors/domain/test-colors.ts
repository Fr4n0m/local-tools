const HEX_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export type ColorPair = {
  foreground: string;
  background: string;
};

export function parseColorList(input: string): string[] {
  const seen = new Set<string>();
  const normalized = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((value) => (value.startsWith("#") ? value : `#${value}`))
    .map((value) => value.toLowerCase())
    .filter((value) => HEX_REGEX.test(value));

  for (const color of normalized) seen.add(color);
  return Array.from(seen).slice(0, 12);
}

export function buildColorPairs(colors: string[]): ColorPair[] {
  const pairs: ColorPair[] = [];
  for (let i = 0; i < colors.length; i += 1) {
    for (let j = 0; j < colors.length; j += 1) {
      if (i === j) continue;
      pairs.push({ foreground: colors[i], background: colors[j] });
    }
  }
  return pairs;
}
