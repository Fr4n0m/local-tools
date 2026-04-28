export function clampGlassOpacity(value: number): number {
  if (!Number.isFinite(value)) return 0.28;
  return Math.max(0.05, Math.min(0.8, Number(value.toFixed(2))));
}

export function buildLiquidGlassCss(opacity: number, blur: number): string {
  const safeOpacity = clampGlassOpacity(opacity);
  const safeBlur = Math.max(4, Math.min(40, Math.round(blur)));

  return `.liquid-glass {\n  background: linear-gradient(135deg, rgba(255,255,255,${safeOpacity}), rgba(255,255,255,${Math.max(0.05, safeOpacity - 0.12)}));\n  border: 1px solid rgba(255,255,255,0.35);\n  box-shadow: 0 20px 40px rgba(0,0,0,0.25);\n  backdrop-filter: blur(${safeBlur}px) saturate(140%);\n  -webkit-backdrop-filter: blur(${safeBlur}px) saturate(140%);\n  border-radius: 24px;\n}`;
}
