export type MeshStop = {
  color: string;
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeStops(stops: MeshStop[]): MeshStop[] {
  return stops.map((stop) => ({
    color: stop.color,
    x: clamp(stop.x, 0, 100),
    y: clamp(stop.y, 0, 100),
  }));
}

export function buildMeshGradientCss(stops: MeshStop[]): string {
  const safe = normalizeStops(stops).slice(0, 6);
  const layers = safe.map(
    (stop) =>
      `radial-gradient(circle at ${stop.x}% ${stop.y}%, ${stop.color} 0%, transparent 55%)`,
  );

  return `background-color: #0b0f14;\nbackground-image: ${layers.join(",\n  ")};`;
}

export function buildMeshGradientSvg(stops: MeshStop[]): string {
  const safe = normalizeStops(stops).slice(0, 6);
  const circles = safe
    .map(
      (stop) =>
        `<radialGradient id="g-${stop.x}-${stop.y}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${stop.color}" stop-opacity="1"/><stop offset="100%" stop-color="${stop.color}" stop-opacity="0"/></radialGradient><circle cx="${stop.x}%" cy="${stop.y}%" r="35%" fill="url(#g-${stop.x}-${stop.y})"/>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#0b0f14"/>${circles}</svg>`;
}
