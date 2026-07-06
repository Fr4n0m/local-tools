import { describe, expect, it } from "vitest";

import {
  parseCsv,
  parseJson,
  parseTsv,
  rowsFromMatrix,
  toMarkdownTable,
} from "@/modules/data-to-markdown/domain/data-to-markdown";

describe("data-to-markdown domain", () => {
  it("parses csv rows", () => {
    const rows = parseCsv("name,role\nFran,Dev");
    expect(rows).toEqual([{ name: "Fran", role: "Dev" }]);
  });

  it("parses json rows", () => {
    const rows = parseJson('[{"name":"Fran","active":true}]');
    expect(rows[0]).toEqual({ name: "Fran", active: "true" });
  });

  it("parses tsv rows", () => {
    const rows = parseTsv("name\trole\nFran\tDev");
    expect(rows).toEqual([{ name: "Fran", role: "Dev" }]);
  });

  it("builds rows from matrix", () => {
    const rows = rowsFromMatrix([
      ["name", "role"],
      ["Fran", "Dev"],
    ]);
    expect(rows).toEqual([{ name: "Fran", role: "Dev" }]);
  });

  it("formats markdown table", () => {
    const output = toMarkdownTable([{ name: "Fran", role: "Dev" }]);
    expect(output).toContain("| name | role |");
    expect(output).toContain("| Fran | Dev |");
  });

  it("supports right alignment", () => {
    const output = toMarkdownTable([{ name: "Fran" }], "right");
    expect(output).toContain("| ---: |");
  });
});
