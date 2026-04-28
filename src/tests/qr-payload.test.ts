import { describe, expect, it } from "vitest";

import { buildQrPayloadUseCase } from "@/modules/qr-generator/application/build-qr-payload-use-case";
import {
  buildQrPayload,
  isQrPayloadValid,
} from "@/modules/qr-generator/domain/qr-payload";

describe("qr payload", () => {
  it("builds url payload", () => {
    expect(buildQrPayload({ type: "url", value: "https://example.com" })).toBe(
      "https://example.com",
    );
  });

  it("builds wifi payload", () => {
    expect(
      buildQrPayload({
        type: "wifi",
        wifi: {
          ssid: "MyNet",
          password: "superSecret",
          encryption: "WPA",
          hidden: false,
        },
      }),
    ).toBe("WIFI:T:WPA;S:MyNet;P:superSecret;H:false;;");
  });

  it("returns invalid on empty payload", () => {
    expect(isQrPayloadValid("   ")).toBe(false);
    expect(buildQrPayloadUseCase({ type: "text", value: "   " })).toEqual({
      ok: false,
      error: "empty_payload",
    });
  });

  it("returns valid payload from use-case", () => {
    expect(
      buildQrPayloadUseCase({ type: "text", value: "local tools" }),
    ).toEqual({
      ok: true,
      value: "local tools",
    });
  });
});
