export type TabularRow = Record<string, string>;
export type MarkdownAlignment = "left" | "center" | "right";

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseCsv(input: string): TabularRow[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h || "column");
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: TabularRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

export function parseTsv(input: string): TabularRow[] {
  return parseCsv(input.replace(/\t/g, ","));
}

export function parseJson(input: string): TabularRow[] {
  try {
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    if (typeof parsed[0] !== "object" || parsed[0] === null) return [];

    return parsed.map((item) => {
      const row: TabularRow = {};
      Object.entries(item as Record<string, unknown>).forEach(
        ([key, value]) => {
          row[key] =
            typeof value === "string"
              ? value
              : value === null || value === undefined
                ? ""
                : JSON.stringify(value);
        },
      );
      return row;
    });
  } catch {
    return [];
  }
}

export function rowsFromMatrix(matrix: string[][]): TabularRow[] {
  if (matrix.length < 2) return [];
  const [headers, ...body] = matrix;
  return body.map((values) => {
    const row: TabularRow = {};
    headers.forEach((header, index) => {
      row[header || `column_${index + 1}`] = values[index] ?? "";
    });
    return row;
  });
}

function separatorForAlignment(alignment: MarkdownAlignment): string {
  if (alignment === "center") return ":---:";
  if (alignment === "right") return "---:";
  return ":---";
}

export function toMarkdownTable(
  rows: TabularRow[],
  alignment: MarkdownAlignment = "left",
): string {
  if (rows.length === 0) return "";

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>()),
  );

  if (headers.length === 0) return "";

  const headerLine = `| ${headers.join(" | ")} |`;
  const separatorLine = `| ${headers.map(() => separatorForAlignment(alignment)).join(" | ")} |`;
  const valueLines = rows.map((row) => {
    const cells = headers.map((header) => escapeCell(row[header] ?? ""));
    return `| ${cells.join(" | ")} |`;
  });

  return [headerLine, separatorLine, ...valueLines].join("\n");
}
