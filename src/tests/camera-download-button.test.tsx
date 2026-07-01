import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CameraDownloadButton } from "@/shared/presentation/components/camera-download-button";

describe("CameraDownloadButton", () => {
  it("keeps conversion and download as separate controls", () => {
    const onConvert = vi.fn();
    const onDownload = vi.fn();
    render(
      <CameraDownloadButton
        convertLabel="Convert image"
        downloadLabel="Download converted image"
        imageAlt="Converted preview"
        imageUrl="blob:converted"
        onConvert={onConvert}
        onDownload={onDownload}
        resultKey="1"
      />,
    );
    const camera = screen.getByRole("button", { name: "Convert image" });
    const photo = screen.getByRole("button", {
      name: "Download converted image",
    });
    expect(camera).not.toContainElement(photo);
    expect(photo).toHaveClass("is-awaiting-download");
    fireEvent.click(camera);
    fireEvent.click(photo);
    expect(photo).toHaveClass("is-downloaded");
    expect(onConvert).toHaveBeenCalledOnce();
    expect(onDownload).toHaveBeenCalledOnce();
  });
  it("blocks busy conversion and hides missing result", () => {
    render(
      <CameraDownloadButton
        busy
        convertLabel="Converting"
        downloadLabel="Download"
        imageAlt="Preview"
        onConvert={() => undefined}
        onDownload={() => undefined}
      />,
    );
    const camera = screen.getByRole("button", { name: "Converting" });
    expect(camera).toBeDisabled();
    expect(camera).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("button", { name: "Download" })).toBeNull();
  });
});
