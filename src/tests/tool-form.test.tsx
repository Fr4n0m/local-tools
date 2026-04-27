import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ToolField,
  ToolFileDrop,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
  ToolSelect,
  ToolTextarea,
  ToolToggleField,
} from "@/shared/presentation/components/tool-form";

describe("tool-form", () => {
  it("renders section, field and toggle components", () => {
    render(
      <ToolSection title="Section title">
        <ToolField label="Field label">
          <ToolInput value="abc" onChange={() => undefined} />
        </ToolField>
        <ToolToggleField label="Toggle label">
          <input type="checkbox" />
        </ToolToggleField>
      </ToolSection>,
    );

    expect(screen.getByText("Section title")).toBeInTheDocument();
    expect(screen.getByText("Field label")).toBeInTheDocument();
    expect(screen.getByDisplayValue("abc")).toBeInTheDocument();
    expect(screen.getByText("Toggle label")).toBeInTheDocument();
  });

  it("renders select and textarea wrappers", () => {
    render(
      <>
        <ToolSelect value="png" onChange={() => undefined}>
          <option value="png">PNG</option>
        </ToolSelect>
        <ToolTextarea value="content" onChange={() => undefined} />
      </>,
    );

    expect(screen.getByDisplayValue("PNG")).toBeInTheDocument();
    expect(screen.getByDisplayValue("content")).toBeInTheDocument();
  });

  it("renders output block with label and value", () => {
    render(<ToolOutputBlock label="Output" value="hello world" />);

    expect(screen.getByText("Output")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hello world")).toBeInTheDocument();
  });

  it("calls onSelectFiles when choosing files from input", () => {
    const onSelectFiles = vi.fn();

    render(
      <ToolFileDrop
        accept="image/*"
        dropHint="Drop files"
        label="Select files"
        onSelectFiles={onSelectFiles}
      />,
    );

    const fileInput = screen.getByLabelText("Select files");
    const file = new File(["test"], "test.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onSelectFiles).toHaveBeenCalledTimes(1);
    expect(onSelectFiles).toHaveBeenLastCalledWith([file]);
  });

  it("calls onSelectFiles when dropping files", () => {
    const onSelectFiles = vi.fn();

    render(
      <ToolFileDrop
        accept="image/*"
        dropHint="Drop files"
        label="Drop area"
        onSelectFiles={onSelectFiles}
      />,
    );

    const container = screen.getByText("Drop files").parentElement;
    const file = new File(["drop"], "drop.png", { type: "image/png" });
    const dataTransfer = { files: [file] };

    if (!container) {
      throw new Error("drop container not found");
    }

    fireEvent.dragOver(container, { dataTransfer });
    fireEvent.drop(container, { dataTransfer });

    expect(onSelectFiles).toHaveBeenCalledTimes(1);
    expect(onSelectFiles).toHaveBeenLastCalledWith([file]);
  });
});
