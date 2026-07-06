import { parse, type ParseError } from "jsonc-parser";

type JsonFormatSuccess = { ok: true; value: string };
type JsonFormatError = {
  ok: false;
  error: {
    message: string;
    position: number | null;
    line: number | null;
    column: number | null;
  };
};

type JsonRepairSuccess = { ok: true; value: string };
type JsonRepairError = JsonFormatError;

type JsonPathResult =
  | { ok: true; value: string }
  | { ok: false; reason: "missing" | "invalid-path" };

export type JsonFormatOptions = {
  minify?: boolean;
  sortKeys?: boolean;
};

function parseJsonLike(input: string): unknown {
  const errors: ParseError[] = [];
  const value = parse(input, errors, {
    allowEmptyContent: false,
    allowTrailingComma: true,
    disallowComments: false,
  });
  if (errors.length > 0) {
    throw new Error("Invalid JSON syntax");
  }
  return value;
}

function parseErrorPosition(message: string): {
  position: number | null;
  line: number | null;
  column: number | null;
} {
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const value = Number(positionMatch[1]);
    return {
      position: Number.isFinite(value) ? value : null,
      line: null,
      column: null,
    };
  }

  const lineColumnMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColumnMatch) {
    const line = Number(lineColumnMatch[1]);
    const column = Number(lineColumnMatch[2]);
    return {
      position: null,
      line: Number.isFinite(line) ? line : null,
      column: Number.isFinite(column) ? column : null,
    };
  }

  return { position: null, line: null, column: null };
}

function parsePositionFromJsonc(input: string): number | null {
  const errors: ParseError[] = [];
  parse(input, errors, {
    allowEmptyContent: false,
    allowTrailingComma: false,
    disallowComments: true,
  });

  if (errors.length === 0) {
    return null;
  }

  return errors[0].offset;
}

function positionToLineColumn(input: string, position: number | null) {
  if (position === null || position < 0) {
    return { line: null, column: null };
  }
  const safePosition = Math.min(position, input.length);
  const before = input.slice(0, safePosition);
  const lines = before.split("\n");
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => a.localeCompare(b),
    );

    return Object.fromEntries(
      entries.map(([key, entryValue]) => [key, sortJsonValue(entryValue)]),
    );
  }

  return value;
}

export function formatJson(
  input: string,
  options: JsonFormatOptions = {},
): JsonFormatSuccess | JsonFormatError {
  try {
    const parsed = JSON.parse(input);
    const value = options.sortKeys ? sortJsonValue(parsed) : parsed;
    return {
      ok: true,
      value: JSON.stringify(value, null, options.minify ? 0 : 2),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid JSON syntax";
    const parsed = parseErrorPosition(message);
    const position = parsed.position ?? parsePositionFromJsonc(input);
    const computedLineColumn = positionToLineColumn(input, position);
    const line = parsed.line ?? computedLineColumn.line;
    const column = parsed.column ?? computedLineColumn.column;

    return {
      ok: false,
      error: {
        message,
        position,
        line,
        column,
      },
    };
  }
}

export function repairJson(
  input: string,
  options: JsonFormatOptions = {},
): JsonRepairSuccess | JsonRepairError {
  try {
    const parsed = parseJsonLike(input);
    const value = options.sortKeys ? sortJsonValue(parsed) : parsed;
    return {
      ok: true,
      value: JSON.stringify(value, null, options.minify ? 0 : 2),
    };
  } catch {
    return formatJson(input, options);
  }
}

function splitJsonPath(path: string): string[] {
  return path
    .trim()
    .replace(/^\$\.?/, "")
    .split(".")
    .flatMap((segment) =>
      segment
        .split(/\[([0-9]+)\]/g)
        .filter(Boolean)
        .map((part) => part.trim()),
    )
    .filter(Boolean);
}

export function resolveJsonPath(input: string, path: string): JsonPathResult {
  const segments = splitJsonPath(path);
  if (segments.length === 0) {
    return { ok: false, reason: "invalid-path" };
  }

  try {
    let current: unknown = JSON.parse(input);
    for (const segment of segments) {
      if (Array.isArray(current)) {
        const index = Number(segment);
        if (!Number.isInteger(index) || index < 0 || index >= current.length) {
          return { ok: false, reason: "missing" };
        }
        current = current[index];
        continue;
      }

      if (!current || typeof current !== "object") {
        return { ok: false, reason: "missing" };
      }

      if (!(segment in (current as Record<string, unknown>))) {
        return { ok: false, reason: "missing" };
      }

      current = (current as Record<string, unknown>)[segment];
    }

    return {
      ok: true,
      value:
        typeof current === "string"
          ? current
          : JSON.stringify(current, null, 2),
    };
  } catch {
    return { ok: false, reason: "missing" };
  }
}
