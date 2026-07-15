import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import "@/app/styles/tools-privacy.css";
import { ToolInfoPopover } from "@/shared/presentation/components/tool-info-popover";

describe("ToolInfoPopover", () => {
  it("uses a focusable trigger without persistent click state", () => {
    render(
      <ToolInfoPopover
        content={
          <section className="favicon-info-section">
            <ul>
              <li>Contenido informativo que debe conservar una línea normal</li>
            </ul>
          </section>
        }
        label="Sobre esta herramienta"
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Sobre esta herramienta",
    });
    const tooltip = screen.getByRole("tooltip");

    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
    expect(document.querySelector("details")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).not.toHaveAttribute("aria-expanded");
    expect(getComputedStyle(screen.getByRole("listitem")).display).toBe(
      "list-item",
    );
  });
});
