import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ToolField,
  ToolFileDrop,
  ToolInput,
  ToolOutputBlock,
  ToolSection,
  ToolSelect,
  ToolSlider,
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

  it("renders select dropdown and textarea wrappers", () => {
    const onChange = vi.fn();

    render(
      <>
        <ToolSelect
          options={[
            { value: "png", label: "PNG" },
            { value: "jpeg", label: "JPEG" },
          ]}
          value="png"
          onChange={onChange}
        />
        <ToolTextarea value="content" onChange={() => undefined} />
      </>,
    );

    expect(screen.getByText("PNG")).toBeInTheDocument();
    expect(screen.getByDisplayValue("content")).toBeInTheDocument();
  });

  it("opens dropdown and selects option on click", () => {
    const onChange = vi.fn();

    render(
      <ToolSelect
        options={[
          { value: "png", label: "PNG" },
          { value: "jpeg", label: "JPEG" },
        ]}
        value="png"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /png/i }));
    expect(screen.getByRole("option", { name: "JPEG" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "JPEG" }));
    expect(onChange).toHaveBeenCalledWith("jpeg");
  });

  it("closes dropdown on Escape key", () => {
    render(
      <ToolSelect
        options={[
          { value: "a", label: "Option A" },
          { value: "b", label: "Option B" },
        ]}
        value="a"
        onChange={() => undefined}
      />,
    );

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    expect(
      screen.getByRole("option", { name: "Option B" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(
      screen.queryByRole("option", { name: "Option B" }),
    ).not.toBeInTheDocument();
  });

  it("navigates options with arrow keys and selects with Enter", () => {
    const onChange = vi.fn();

    render(
      <ToolSelect
        options={[
          { value: "a", label: "Option A" },
          { value: "b", label: "Option B" },
          { value: "c", label: "Option C" },
        ]}
        value="a"
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("button");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("renders slider with display value", () => {
    render(
      <ToolSlider
        displayValue="90%"
        max={1}
        min={0}
        step={0.1}
        value={0.9}
        onChange={() => undefined}
      />,
    );

    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
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
