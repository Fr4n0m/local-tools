export function isPdfFile(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function toPageImageName(fileName: string, page: number): string {
  const base = fileName.replace(/\.[^.]+$/, "") || "document";
  const suffix = String(page).padStart(3, "0");
  return `${base}-page-${suffix}.png`;
}

export function clampScale(value: number): number {
  if (!Number.isFinite(value)) return 1.5;
  return Math.min(3, Math.max(1, value));
}
