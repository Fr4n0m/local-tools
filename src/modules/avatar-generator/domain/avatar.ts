export type AvatarShape = "circle" | "rounded" | "square";

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
  const size = Math.max(64, Math.min(1024, Math.round(params.size)));
  const radius =
    params.shape === "circle"
      ? size / 2
      : params.shape === "rounded"
        ? size * 0.24
        : 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${params.background}"/><text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="${params.textColor}" font-family="ui-sans-serif, system-ui" font-size="${Math.floor(size * 0.38)}" font-weight="700">${params.initials}</text></svg>`;
}
