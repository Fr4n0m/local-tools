export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

export function clampBitrateKbps(value: number): number {
  if (!Number.isFinite(value)) return 1200;
  return Math.max(300, Math.min(6000, Math.round(value)));
}

export function compressedVideoName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "") || "video";
  return `${base}-compressed.webm`;
}

export function bestRecorderMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  for (const mime of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(mime)
    ) {
      return mime;
    }
  }

  return "video/webm";
}
