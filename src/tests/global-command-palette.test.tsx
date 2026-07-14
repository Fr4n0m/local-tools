import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalCommandPalette } from "@/shared/presentation/components/global-command-palette";

const { commandPaletteSpy } = vi.hoisted(() => ({
  commandPaletteSpy: vi.fn((props: unknown) => {
    void props;
    return null;
  }),
}));

vi.mock("@cmd-kit/react", () => ({
  CommandPalette: (props: unknown) => commandPaletteSpy(props),
}));

describe("GlobalCommandPalette", () => {
  beforeEach(() => {
    commandPaletteSpy.mockClear();
    window.localStorage.clear();
  });

  it("connects CMD-KIT slots to the LocalTools visual state classes", () => {
    render(<GlobalCommandPalette />);

    expect(
      screen.getByRole("button", { name: /open commands/i }),
    ).toBeVisible();
    expect(commandPaletteSpy).toHaveBeenCalled();
    expect(commandPaletteSpy.mock.lastCall?.[0]).toMatchObject({
      classNames: {
        closeButton: "lt-command-close",
        dialog: "lt-command-dialog",
        input: "lt-command-input",
        item: "lt-command-item",
      },
    });
  });
});
