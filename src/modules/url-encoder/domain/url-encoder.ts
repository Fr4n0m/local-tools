export type UrlEncodeMode = "component" | "full-url";

export type UrlEncodeOptions = {
  mode?: UrlEncodeMode;
  usePlusForSpaces?: boolean;
  multiline?: boolean;
};

function encodeValue(input: string, mode: UrlEncodeMode): string {
  if (mode === "full-url") {
    try {
      return encodeURI(input);
    } catch {
      return encodeURIComponent(input);
    }
  }

  return encodeURIComponent(input);
}

export function encodeUrl(
  input: string,
  options: UrlEncodeOptions = {},
): string {
  const mode = options.mode ?? "component";
  const lines = options.multiline ? input.split(/\r?\n/) : [input];
  const encoded = lines.map((line) => {
    const value = encodeValue(line, mode);
    return options.usePlusForSpaces ? value.replace(/%20/g, "+") : value;
  });
  return options.multiline ? encoded.join("\n") : encoded[0];
}

export function decodeUrl(
  input: string,
  options: Pick<UrlEncodeOptions, "multiline" | "usePlusForSpaces"> = {},
): { ok: true; value: string } | { ok: false } {
  try {
    const lines = options.multiline ? input.split(/\r?\n/) : [input];
    const decoded = lines.map((line) => {
      const value = options.usePlusForSpaces
        ? line.replace(/\+/g, "%20")
        : line;
      return decodeURIComponent(value);
    });
    return {
      ok: true,
      value: options.multiline ? decoded.join("\n") : decoded[0],
    };
  } catch {
    return { ok: false };
  }
}
