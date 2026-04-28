export type LoaderType = "spinner" | "dots" | "pulse";

export function buildLoaderCss(
  type: LoaderType,
  color: string,
  size: number,
): string {
  const safeSize = Math.max(16, Math.min(120, Math.round(size)));

  if (type === "dots") {
    return `.loader{display:inline-flex;gap:${Math.max(4, Math.floor(safeSize / 8))}px}.loader span{width:${Math.floor(safeSize / 5)}px;height:${Math.floor(safeSize / 5)}px;border-radius:999px;background:${color};animation:dot 1s infinite ease-in-out}.loader span:nth-child(2){animation-delay:.15s}.loader span:nth-child(3){animation-delay:.3s}@keyframes dot{0%,80%,100%{transform:scale(.5);opacity:.4}40%{transform:scale(1);opacity:1}}`;
  }

  if (type === "pulse") {
    return `.loader{width:${safeSize}px;height:${safeSize}px;border-radius:999px;background:${color};animation:pulse 1.2s infinite ease-in-out}@keyframes pulse{0%,100%{transform:scale(.7);opacity:.55}50%{transform:scale(1);opacity:1}}`;
  }

  return `.loader{width:${safeSize}px;height:${safeSize}px;border:${Math.max(2, Math.floor(safeSize / 10))}px solid color-mix(in srgb, ${color} 28%, transparent);border-top-color:${color};border-radius:999px;animation:spin .9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;
}
