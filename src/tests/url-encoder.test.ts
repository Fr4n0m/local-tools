import { describe, expect, it } from "vitest";

import { urlEncoderUseCase } from "@/modules/url-encoder/application/url-encoder-use-case";

describe("urlEncoderUseCase", () => {
  it("encodes url content", () => {
    const output = urlEncoderUseCase.encode("hello world?x=1&y=2");

    expect(output).toBe("hello%20world%3Fx%3D1%26y%3D2");
  });

  it("decodes valid encoded string", () => {
    const output = urlEncoderUseCase.decode("hello%20world");

    expect(output.ok).toBe(true);
    if (output.ok) {
      expect(output.value).toBe("hello world");
    }
  });

  it("returns error for malformed encoded string", () => {
    const output = urlEncoderUseCase.decode("%E0%A4%A");

    expect(output.ok).toBe(false);
  });
});
