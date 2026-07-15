import { readFileSync } from "node:fs";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalCommandPalette } from "@/shared/presentation/components/global-command-palette";

const { commandPaletteSpy } = vi.hoisted(() => ({
  commandPaletteSpy: vi.fn((rawProps: unknown) => {
    const props = rawProps as {
      classNames?: { item?: string; list?: string };
    };
    return (
      <div className={props.classNames?.list} role="listbox">
        <button
          aria-selected="true"
          className={props.classNames?.item}
          role="option"
          type="button"
        >
          Active command
        </button>
      </div>
    );
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
        list: "lt-command-list",
      },
    });
  });

  it("reserves a scroll gutter around raised command items", () => {
    render(<GlobalCommandPalette />);

    const list = screen.getByRole("listbox");
    const activeItem = screen.getByRole("option", { selected: true });
    const stylesheet = readFileSync(
      `${process.cwd()}/src/app/styles/command-palette.css`,
      "utf8",
    );
    const listRule = stylesheet.match(/\.lt-command-list\s*\{([^}]*)\}/)?.[1];

    expect(activeItem).toHaveClass("lt-command-item");
    expect(list).toHaveClass("lt-command-list");
    expect(listRule).toMatch(/padding:\s*2px 5px 5px 2px/);
    expect(listRule).toMatch(/scroll-padding-block:\s*2px 5px/);
  });
});
