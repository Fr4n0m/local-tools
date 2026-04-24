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

export function formatJson(input: string): JsonFormatSuccess | JsonFormatError {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, value: JSON.stringify(parsed, null, 2) };
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
import { parse, type ParseError } from "jsonc-parser";
