export type ColorStop = {
  step: number;
  hex: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(clamp(Math.round(r), 0, 255))}${toHex(clamp(Math.round(g), 0, 255))}${toHex(clamp(Math.round(b), 0, 255))}`;
}

function mix(
  base: { r: number; g: number; b: number },
  target: { r: number; g: number; b: number },
  ratio: number,
): string {
  const r = base.r + (target.r - base.r) * ratio;
  const g = base.g + (target.g - base.g) * ratio;
  const b = base.b + (target.b - base.b) * ratio;
  return rgbToHex(r, g, b);
}

export function generateColorRange(
  baseHex: string,
  stepsInput: number,
): ColorStop[] {
  const base = hexToRgb(baseHex);
  if (!base) return [];

  const steps = clamp(Math.trunc(stepsInput), 3, 11);
  const middleIndex = Math.floor(steps / 2);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const scale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  return Array.from({ length: steps }, (_, index) => {
    if (index === middleIndex) {
      return { step: scale[index], hex: rgbToHex(base.r, base.g, base.b) };
    }

    if (index < middleIndex) {
      const ratio = (middleIndex - index) / (middleIndex + 1);
      return { step: scale[index], hex: mix(base, white, ratio * 0.9) };
    }

    const distance = index - middleIndex;
    const tail = steps - 1 - middleIndex;
    const ratio = tail === 0 ? 0 : distance / tail;
    return { step: scale[index], hex: mix(base, black, ratio * 0.8) };
  });
}

export function toCssVariables(name: string, colors: ColorStop[]): string {
  const tokenName =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "palette";

  return colors
    .map((item) => `--${tokenName}-${item.step}: ${item.hex};`)
    .join("\n");
}
