import { describe, expect, it } from "vitest";

import {
  isHeicFilename,
  isHeicMimeType,
  toJpgName,
} from "@/modules/heic-to-jpg/domain/heic-file";

describe("heic file helpers", () => {
  it("detects heic/heif filenames", () => {
    expect(isHeicFilename("photo.HEIC")).toBe(true);
    expect(isHeicFilename("photo.heif")).toBe(true);
    expect(isHeicFilename("photo.jpg")).toBe(false);
  });

  it("detects heic mime types", () => {
    expect(isHeicMimeType("image/heic")).toBe(true);
    expect(isHeicMimeType("image/heif")).toBe(true);
    expect(isHeicMimeType("image/jpeg")).toBe(false);
  });

  it("converts filename extension to jpg", () => {
    expect(toJpgName("my-picture.heic")).toBe("my-picture.jpg");
    expect(toJpgName("my-picture")).toBe("my-picture.jpg");
  });
});
