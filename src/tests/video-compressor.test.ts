import { describe, expect, it } from "vitest";

import {
  clampBitrateKbps,
  compressedVideoName,
} from "@/modules/video-compressor/domain/video-compressor";

describe("video compressor domain", () => {
  it("clamps bitrate", () => {
    expect(clampBitrateKbps(0)).toBe(300);
    expect(clampBitrateKbps(10000)).toBe(6000);
  });

  it("builds output filename", () => {
    expect(compressedVideoName("clip.mp4")).toBe("clip-compressed.webm");
  });
});
