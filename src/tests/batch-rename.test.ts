import { describe, expect, it } from "vitest";

import { batchRenamePreviewUseCase } from "@/modules/batch-rename/application/batch-rename-preview-use-case";

describe("batchRenamePreviewUseCase", () => {
  it("builds preview replacing matching text", () => {
    const preview = batchRenamePreviewUseCase(
      "file-a.txt\nfile-b.txt",
      "file",
      "doc",
    );

    expect(preview).toEqual([
      { original: "file-a.txt", renamed: "doc-a.txt" },
      { original: "file-b.txt", renamed: "doc-b.txt" },
    ]);
  });

  it("ignores blank lines", () => {
    const preview = batchRenamePreviewUseCase("\nfirst\n\nsecond\n", "", "");

    expect(preview).toEqual([
      { original: "first", renamed: "first" },
      { original: "second", renamed: "second" },
    ]);
  });
});
