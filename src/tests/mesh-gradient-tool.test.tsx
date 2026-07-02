import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MeshGradientTool } from "@/modules/mesh-gradient/presentation/components/mesh-gradient-tool";

describe("MeshGradientTool", () => {
  it("disables width and height while SVG export is selected", () => {
    render(<MeshGradientTool language="en" />);

    expect(screen.getByRole("spinbutton", { name: "Width" })).toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: "Height" })).toBeDisabled();
    expect(
      screen.getByText(
        "SVG keeps its own scalable vector output, so width and height stay disabled here.",
      ),
    ).toBeInTheDocument();
  });

  it("allows adding and removing colors up to the configured cap", () => {
    render(<MeshGradientTool language="en" />);

    const addButton = screen.getByRole("button", { name: "Add color" });
    for (let count = 4; count < 10; count += 1) {
      fireEvent.click(addButton);
    }

    expect(screen.getByText("10 colors active · max 10")).toBeInTheDocument();
    expect(addButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Remove color 10" }));
    expect(screen.getByText("9 colors active · max 10")).toBeInTheDocument();
    expect(addButton).toBeEnabled();
  });
});
