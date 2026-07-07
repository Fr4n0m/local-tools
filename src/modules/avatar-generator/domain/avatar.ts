import { z } from "zod";

export type AvatarShape = "circle" | "rounded" | "square";

const avatarShapeSchema = z.enum(["circle", "rounded", "square"]);
const avatarColorSchema = z
  .string()
  .trim()
  .regex(
    /^(#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})|(?:rgb|rgba|hsl|hsla)\(.+\)|[a-zA-Z]+)$/,
  );

export const avatarInputSchema = z.object({
  size: z.coerce.number().int().min(64).max(1024),
  initials: z.string().trim().min(1).max(4),
  background: avatarColorSchema,
  textColor: avatarColorSchema,
  shape: avatarShapeSchema,
});

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "LT";
  return parts.map((part) => part[0].toUpperCase()).join("");
}

export function avatarSeedColor(seed: string): string {
  const value = seed.trim().toLowerCase() || "localtools";
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 75% 45%)`;
}

export function buildAvatarSvg(params: {
  size: number;
  initials: string;
  background: string;
  textColor: string;
  shape: AvatarShape;
}): string {
  const parsed = avatarInputSchema.parse(params);
  const size = parsed.size;
  const radius =
    parsed.shape === "circle"
      ? size / 2
      : parsed.shape === "rounded"
        ? size * 0.24
        : 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${parsed.background}"/><text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="${parsed.textColor}" font-family="ui-sans-serif, system-ui" font-size="${Math.floor(size * 0.38)}" font-weight="700">${parsed.initials}</text></svg>`;
}
