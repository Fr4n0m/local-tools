import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileHomeMock } from "@/shared/presentation/components/mobile-home-mock";

function fallbackImage(container: HTMLElement): HTMLImageElement {
  const image = Array.from(container.querySelectorAll("img")).find(
    (candidate) =>
      candidate.getAttribute("src")?.includes("fallback-app-icon.svg"),
  );

  if (!(image instanceof HTMLImageElement)) {
    throw new Error("Expected mobile fallback image");
  }

  return image;
}

describe("MobileHomeMock fallback shape", () => {
  it("uses the iOS squircle mask only while no app icon is loaded", () => {
    const { container, rerender } = render(
      <MobileHomeMock appName="Example" platform="ios" />,
    );

    expect(fallbackImage(container).className).toContain("iphoneFallbackImage");

    rerender(
      <MobileHomeMock
        appIconUrl="/custom-icon.svg"
        appName="Example"
        platform="ios"
      />,
    );

    expect(
      container.querySelector('img[src*="custom-icon.svg"]')?.className,
    ).not.toContain("iphoneFallbackImage");
  });

  it("uses the Android circular mask while no app icon is loaded", () => {
    const { container } = render(
      <MobileHomeMock appName="Example" platform="android" />,
    );

    expect(fallbackImage(container).className).toContain(
      "androidFallbackImage",
    );
  });
});
