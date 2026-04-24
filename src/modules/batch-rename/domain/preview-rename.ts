export type BatchRenamePreview = {
  original: string;
  renamed: string;
};

export type BatchRenameOptions = {
  prefix: string;
  suffix: string;
  addSequence: boolean;
  startNumber: number;
  padWidth: number;
};

function applyBeforeExtension(name: string, suffix: string): string {
  if (!suffix) {
    return name;
  }

  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0) {
    return `${name}${suffix}`;
  }

  return `${name.slice(0, dotIndex)}${suffix}${name.slice(dotIndex)}`;
}

function normalizeNumber(value: number, fallback: number, min = 1): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.floor(value));
}

export function previewRename(
  names: string[],
  searchValue: string,
  replaceValue: string,
  options: BatchRenameOptions,
): BatchRenamePreview[] {
  const safeStart = normalizeNumber(options.startNumber, 1, 0);
  const safePad = normalizeNumber(options.padWidth, 3, 1);

  return names
    .filter((item) => item.trim().length > 0)
    .map((item, index) => {
      let renamed = searchValue
        ? item.replaceAll(searchValue, replaceValue)
        : item;

      if (options.prefix) {
        renamed = `${options.prefix}${renamed}`;
      }

      renamed = applyBeforeExtension(renamed, options.suffix);

      if (options.addSequence) {
        const number = String(safeStart + index).padStart(safePad, "0");
        renamed = `${number}-${renamed}`;
      }

      return {
        original: item,
        renamed,
      };
    });
}
