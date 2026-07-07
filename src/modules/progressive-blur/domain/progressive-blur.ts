import { z } from "zod";

const progressiveBlurInputSchema = z.object({
  maxBlur: z.coerce.number().finite().catch(24),
  stops: z.coerce.number().int().finite().catch(4),
});

export function clampBlur(value: number): number {
  if (!Number.isFinite(value)) return 24;
  return Math.max(2, Math.min(80, Math.round(value)));
}

export function buildProgressiveBlurCss(
  maxBlur: number,
  stops: number,
): string {
  const parsed = progressiveBlurInputSchema.parse({ maxBlur, stops });
  const blur = clampBlur(parsed.maxBlur);
  const safeStops = Math.max(2, Math.min(8, Math.round(parsed.stops)));
  const layers = Array.from({ length: safeStops }, (_, i) => {
    const pct = Math.round((i / (safeStops - 1)) * 100);
    return `rgba(255,255,255,${(1 - i / safeStops).toFixed(2)}) ${pct}%`;
  });

  return `.progressive-blur {\n  position: relative;\n}\n.progressive-blur::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  backdrop-filter: blur(${blur}px);\n  -webkit-backdrop-filter: blur(${blur}px);\n  mask-image: linear-gradient(to bottom, ${layers.join(", ")});\n}`;
}
