export function isPdfFile(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function clampScale(value: number): number {
  if (!Number.isFinite(value)) return 0.75;
  return Math.max(0.3, Math.min(1, Number(value.toFixed(2))));
}

export function clampQuality(value: number): number {
  if (!Number.isFinite(value)) return 0.7;
  return Math.max(0.3, Math.min(0.95, Number(value.toFixed(2))));
}

export function compressedPdfName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "") || "document";
  return `${base}-compressed.pdf`;
}
