import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UnsubscribeClient } from "@/app/unsubscribe/unsubscribe-client";

vi.mock("sileo", () => ({
  sileo: {
    promise: async (request: Promise<unknown>) => request,
  },
}));

describe("UnsubscribeClient", () => {
  beforeEach(() => {
    window.localStorage.setItem("localtools.language", "en");
    vi.restoreAllMocks();
  });

  it("shows an invalid state without calling the API when token is missing", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<UnsubscribeClient token="" />);

    expect(
      screen.getByText("This unsubscribe link is invalid or has expired."),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("requires explicit confirmation for a valid token", () => {
    render(<UnsubscribeClient token="valid-token" />);

    expect(
      screen.getByRole("button", { name: "Confirm unsubscribe" }),
    ).toBeInTheDocument();
  });

  it("replaces the confirmation state with a completed state after success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    render(<UnsubscribeClient token="valid-token" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm unsubscribe" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Unsubscribed" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Confirm unsubscribe" }),
    ).not.toBeInTheDocument();
  });

  it("keeps retry available after a request error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);

    render(<UnsubscribeClient token="valid-token" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm unsubscribe" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Could not complete the unsubscribe. Try again."),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: "Could not unsubscribe" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm unsubscribe" }),
    ).toBeEnabled();
  });
});
