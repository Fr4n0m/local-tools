import { describe, expect, it } from "vitest";

import {
  parseCsv,
  parseJson,
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

  it("formats markdown table", () => {
    const output = toMarkdownTable([{ name: "Fran", role: "Dev" }]);
    expect(output).toContain("| name | role |");
    expect(output).toContain("| Fran | Dev |");
  });
});
