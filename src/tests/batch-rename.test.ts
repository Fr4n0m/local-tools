import { describe, expect, it } from "vitest";

import { batchRenamePreviewUseCase } from "@/modules/batch-rename/application/batch-rename-preview-use-case";

describe("batchRenamePreviewUseCase", () => {
  it("builds preview replacing matching text", () => {
    const preview = batchRenamePreviewUseCase(
      "file-a.txt\nfile-b.txt",
      "file",
      "doc",
      {
        prefix: "",
        suffix: "",
        addSequence: false,
        startNumber: 1,
        padWidth: 3,
      },
    );

    expect(preview).toEqual([
      { original: "file-a.txt", renamed: "doc-a.txt" },
      { original: "file-b.txt", renamed: "doc-b.txt" },
    ]);
  });

  it("ignores blank lines", () => {
    const preview = batchRenamePreviewUseCase("\nfirst\n\nsecond\n", "", "", {
      prefix: "",
      suffix: "",
      addSequence: false,
      startNumber: 1,
      padWidth: 3,
    });

    expect(preview).toEqual([
      { original: "first", renamed: "first" },
      { original: "second", renamed: "second" },
    ]);
  });

  it("applies prefix suffix and sequence", () => {
    const preview = batchRenamePreviewUseCase("image.png\nclip.mov", "", "", {
      prefix: "new-",
      suffix: "-v2",
      addSequence: true,
      startNumber: 7,
      padWidth: 2,
    });

    expect(preview).toEqual([
      { original: "image.png", renamed: "07-new-image-v2.png" },
      { original: "clip.mov", renamed: "08-new-clip-v2.mov" },
    ]);
  });
});
