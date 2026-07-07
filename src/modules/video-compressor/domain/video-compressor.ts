import { z } from "zod";

const videoCompressorSchema = z.object({
  bitrateKbps: z.coerce.number().finite().catch(1200),
  fileName: z.string().trim().max(260).catch("video"),
});

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

export function clampBitrateKbps(value: number): number {
  const parsed = videoCompressorSchema.parse({
    bitrateKbps: value,
    fileName: "video",
  });
  if (!Number.isFinite(parsed.bitrateKbps)) return 1200;
  return Math.max(300, Math.min(6000, Math.round(parsed.bitrateKbps)));
}

export function compressedVideoName(fileName: string): string {
  const parsed = videoCompressorSchema.parse({
    bitrateKbps: 1200,
    fileName,
  });
  const base = parsed.fileName.replace(/\.[^.]+$/, "") || "video";
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
