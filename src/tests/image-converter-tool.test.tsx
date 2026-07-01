import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { convertImageFile } from "@/modules/image-converter/domain/image-converter";
import { ImageConverterTool } from "@/modules/image-converter/presentation/components/image-converter-tool";
import { downloadBlob } from "@/shared/lib/download";
import { createZipBlob } from "@/shared/lib/zip";

vi.mock("@/modules/image-converter/domain/image-converter", async () => {
  const actual = await vi.importActual<
    typeof import("@/modules/image-converter/domain/image-converter")
  >("@/modules/image-converter/domain/image-converter");
  return { ...actual, convertImageFile: vi.fn() };
});

vi.mock("@/shared/lib/download", () => ({ downloadBlob: vi.fn() }));
vi.mock("@/shared/lib/zip", () => ({ createZipBlob: vi.fn() }));

const convertMock = vi.mocked(convertImageFile);
const downloadMock = vi.mocked(downloadBlob);
const zipMock = vi.mocked(createZipBlob);

describe("ImageConverterTool", () => {
  let objectUrlIndex = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    objectUrlIndex = 0;
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => `blob:test-${++objectUrlIndex}`),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
  });

  function selectFiles(files: File[]) {
    fireEvent.change(screen.getByLabelText("Select image"), {
      target: { files },
    });
  }

  it("converts from the camera and downloads from the persistent photo", async () => {
    const output = new Blob(["png"], { type: "image/png" });
    convertMock.mockResolvedValue(output);
    render(<ImageConverterTool language="en" />);

    expect(screen.getByRole("slider")).toBeEnabled();
    selectFiles([new File(["source"], "photo.jpeg", { type: "image/jpeg" })]);
    fireEvent.click(screen.getByRole("button", { name: "Convert selected" }));

    const photo = await screen.findByRole("button", {
      name: "Download converted image",
    });
    fireEvent.click(photo);
    expect(convertMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "photo.jpeg" }),
      "image/jpeg",
      0.9,
    );
    expect(downloadMock).toHaveBeenCalledWith(output, "photo-converted.jpg");
  });

  it("disables quality only when PNG is selected", () => {
    render(<ImageConverterTool language="en" />);

    const slider = screen.getByRole("slider");
    expect(slider).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Output format" }));
    fireEvent.click(screen.getByRole("option", { name: "PNG" }));

    expect(slider).toBeDisabled();
    expect(
      screen.getByText("PNG preserves the image without a quality setting."),
    ).toBeInTheDocument();
  });

  it("shows a localized error and leaves no downloadable photo", async () => {
    convertMock.mockRejectedValue(new Error("decode"));
    render(<ImageConverterTool language="en" />);
    selectFiles([new File(["bad"], "bad.png", { type: "image/png" })]);
    fireEvent.click(screen.getByRole("button", { name: "Convert selected" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This image could not be converted.",
    );
    expect(
      screen.queryByRole("button", { name: "Download converted image" }),
    ).toBeNull();
  });

  it("converts multiple files into one ZIP and clears selected state", async () => {
    convertMock.mockResolvedValue(new Blob(["converted"]));
    const zip = new Blob(["zip"], { type: "application/zip" });
    zipMock.mockResolvedValue(zip);
    render(<ImageConverterTool language="en" />);
    selectFiles([
      new File(["a"], "first.jpg", { type: "image/jpeg" }),
      new File(["b"], "second.webp", { type: "image/webp" }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Convert all (ZIP)" }));
    await waitFor(() => expect(zipMock).toHaveBeenCalledOnce());
    expect(zipMock).toHaveBeenCalledWith([
      expect.objectContaining({ name: "first.jpg" }),
      expect.objectContaining({ name: "second.jpg" }),
    ]);
    expect(downloadMock).toHaveBeenCalledWith(zip, "converted-images.zip");

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(
      screen.getByText("Select or drag an image to start."),
    ).toBeInTheDocument();
  });
});
