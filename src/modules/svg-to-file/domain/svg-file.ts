export function normalizeSvgContent(input: string): string {
  return input.trim();
}

export function isSvgContentValid(input: string): boolean {
  const content = normalizeSvgContent(input);
  if (!content.startsWith("<svg")) return false;
  return content.endsWith("</svg>");
}

export function toSvgDataUrl(svgContent: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
}

export function toPngName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base || "image"}.png`;
}

export function toSvgName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base || "image"}.svg`;
}
