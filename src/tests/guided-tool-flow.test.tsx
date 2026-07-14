import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GuidedToolFlow } from "@/shared/presentation/components/guided-tool-flow";

const labels = {
  backLabel: "Back",
  continueLabel: "Continue",
  exitLabel: "Exit",
  progressLabel: "Guided setup",
  stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
};

describe("GuidedToolFlow", () => {
  it("moves forward and backward while focusing the active heading", async () => {
    render(
      <GuidedToolFlow
        {...labels}
        onExit={() => undefined}
        steps={[
          { id: "source", title: "Source", content: <p>Source content</p> },
          { id: "review", title: "Review", content: <p>Review content</p> },
        ]}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Source" })).toHaveFocus(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Review" })).toHaveFocus(),
    );
    expect(screen.getByText("Review content")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Source" })).toHaveFocus(),
    );
  });

  it("blocks progression until the current step is valid", () => {
    render(
      <GuidedToolFlow
        {...labels}
        onExit={() => undefined}
        steps={[
          {
            id: "source",
            title: "Source",
            content: <p>Source content</p>,
            canContinue: false,
            blockedMessage: "Choose a file first",
          },
          { id: "review", title: "Review", content: <p>Review content</p> },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(screen.getByText("Choose a file first")).toBeInTheDocument();
  });

  it("exits from the header and final step", () => {
    const onExit = vi.fn();
    render(
      <GuidedToolFlow
        {...labels}
        onExit={onExit}
        steps={[{ id: "done", title: "Done", content: <p>Done</p> }]}
      />,
    );

    const exitButtons = screen.getAllByRole("button", { name: "Exit" });
    fireEvent.click(exitButtons[0]);
    fireEvent.click(exitButtons[1]);
    expect(onExit).toHaveBeenCalledTimes(2);
  });
});
