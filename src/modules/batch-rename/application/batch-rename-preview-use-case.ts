import { previewRename } from "@/modules/batch-rename/domain/preview-rename";

export function batchRenamePreviewUseCase(
  rawNames: string,
  searchValue: string,
  replaceValue: string,
) {
  const names = rawNames.split("\n");
  return previewRename(names, searchValue, replaceValue);
}
