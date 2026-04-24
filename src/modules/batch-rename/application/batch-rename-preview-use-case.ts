import {
  previewRename,
  type BatchRenameOptions,
} from "@/modules/batch-rename/domain/preview-rename";

export function batchRenamePreviewUseCase(
  rawNames: string,
  searchValue: string,
  replaceValue: string,
  options: BatchRenameOptions,
) {
  const names = rawNames.split("\n");
  return previewRename(names, searchValue, replaceValue, options);
}
