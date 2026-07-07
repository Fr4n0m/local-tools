import { z } from "zod";

import {
  previewRename,
  type BatchRenameOptions,
} from "@/modules/batch-rename/domain/preview-rename";

const batchRenameInputSchema = z.object({
  rawNames: z.string().max(50_000),
  searchValue: z.string().max(500),
  replaceValue: z.string().max(500),
  options: z.object({
    prefix: z.string().max(200),
    suffix: z.string().max(200),
    addSequence: z.boolean(),
    startNumber: z.coerce
      .number()
      .int()
      .catch(1)
      .transform((value) => Math.max(0, Math.min(999_999, value))),
    padWidth: z.coerce
      .number()
      .int()
      .catch(3)
      .transform((value) => Math.max(1, Math.min(12, value))),
  }),
});

export function batchRenamePreviewUseCase(
  rawNames: string,
  searchValue: string,
  replaceValue: string,
  options: BatchRenameOptions,
) {
  const parsed = batchRenameInputSchema.parse({
    rawNames,
    searchValue,
    replaceValue,
    options,
  });
  const names = parsed.rawNames.split("\n");
  return previewRename(
    names,
    parsed.searchValue,
    parsed.replaceValue,
    parsed.options,
  );
}
