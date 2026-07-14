import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gsapContext } = vi.hoisted(() => ({
  gsapContext: vi.fn(() => ({ revert: vi.fn() })),
}));

vi.mock("gsap", () => ({
  default: {
    context: gsapContext,
    registerPlugin: vi.fn(),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    getAll: vi.fn(() => []),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/shared/presentation/components/simple-page-header", () => ({
  SimplePageHeader: () => null,
}));

vi.mock("@/shared/presentation/components/page-display-controls", () => ({
  PageDisplayControls: () => null,
}));

vi.mock("@/app/overview/components/hero-section", () => ({
  HeroSection: ({ text }: { text: { heroTitle: string } }) => (
    <section>{text.heroTitle}</section>
  ),
}));

vi.mock("@/app/overview/components/story-section", () => ({
  StorySection: () => null,
}));

vi.mock("@/app/overview/components/multi-banner-section", () => ({
  MultiBannerSection: () => null,
}));

vi.mock("@/app/overview/components/carousel-section", () => ({
  CarouselSection: () => null,
}));

vi.mock("@/app/overview/components/discover-section", () => ({
  DiscoverSection: () => null,
}));

vi.mock("@/app/overview/components/home-footer", () => ({
  HomeFooter: () => null,
}));

vi.mock("@/app/overview/components/subscription-status-modal", () => ({
  SubscriptionStatusModal: () => null,
}));

import { OverviewExperience } from "@/app/overview/overview-experience";

describe("overview hero animation lifecycle", () => {
  beforeEach(() => {
    gsapContext.mockClear();
    window.localStorage.clear();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
    });
  });

  it("does not restart the entrance animation when language initializes", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    window.localStorage.setItem("localtools.language", "es");

    render(<OverviewExperience />);
    expect(gsapContext).toHaveBeenCalledTimes(1);

    act(() => {
      frames.splice(0).forEach((callback) => callback(0));
    });

    expect(gsapContext).toHaveBeenCalledTimes(1);
  });
});
