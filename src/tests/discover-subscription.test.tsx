import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DiscoverSection } from "@/app/overview/components/discover-section";
import { sharedMessages } from "@/shared/presentation/i18n";

vi.mock("sileo", () => ({
  sileo: {
    promise: async (request: Promise<unknown>) => request,
  },
}));

vi.mock("@/shared/lib/notify", () => ({ notifyError: vi.fn() }));

describe("DiscoverSection subscription consent", () => {
  it("renders unchecked explicit consent with legal links", () => {
    render(<DiscoverSection language="en" text={sharedMessages.en.overview} />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(
      screen.getByRole("link", { name: "privacy policy" }),
    ).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
  });

  it("submits the explicit consent contract to the portfolio bridge", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    render(<DiscoverSection language="en" text={sharedMessages.en.overview} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "reader@example.com" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Notify me" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());
    const [, request] = fetchSpy.mock.calls[0];
    expect(JSON.parse(String(request?.body))).toEqual({
      email: "reader@example.com",
      locale: "en",
      source: "home-final-card",
      acceptTerms: true,
    });
  });
});
