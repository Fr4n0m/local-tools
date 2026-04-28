import { describe, expect, it } from "vitest";

import { buildLoaderCss } from "@/modules/loader-maker/domain/loader-maker";

describe("loader maker domain", () => {
  it("builds spinner css", () => {
    expect(buildLoaderCss("spinner", "#fff", 40)).toContain("animation:spin");
  });

  it("builds dots css", () => {
    expect(buildLoaderCss("dots", "#fff", 40)).toContain("@keyframes dot");
  });
});
