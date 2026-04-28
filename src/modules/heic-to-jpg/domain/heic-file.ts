export function isHeicFilename(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith(".heic") || lower.endsWith(".heif");
}

export function isHeicMimeType(type: string): boolean {
  return type === "image/heic" || type === "image/heif";
}

export function toJpgName(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  return `${base}.jpg`;
}
