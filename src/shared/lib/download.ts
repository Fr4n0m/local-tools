export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadTextFile(
  content: string,
  filename: string,
  type = "text/plain;charset=utf-8",
) {
  const blob = new Blob([content], { type });
  downloadBlob(blob, filename);
}
