export type BatchRenamePreview = {
  original: string;
  renamed: string;
};

export function previewRename(
  names: string[],
  searchValue: string,
  replaceValue: string,
): BatchRenamePreview[] {
  return names
    .filter((item) => item.trim().length > 0)
    .map((item) => ({
      original: item,
      renamed: searchValue ? item.replaceAll(searchValue, replaceValue) : item,
    }));
}
