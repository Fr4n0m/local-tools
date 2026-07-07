import { z } from "zod";

export type LlmsTxtInput = {
  projectName: string;
  projectUrl: string;
  summary: string;
  docsUrl: string;
  sourceUrl: string;
  license: string;
  rules: string;
};

const maybeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => value.length === 0 || /^https?:\/\/\S+$/i.test(value),
    "invalid_url",
  );

export const llmsTxtInputSchema = z.object({
  projectName: z.string().trim().min(1).max(120),
  projectUrl: maybeUrl,
  summary: z.string().trim().max(500),
  docsUrl: maybeUrl,
  sourceUrl: maybeUrl,
  license: z.string().trim().max(120),
  rules: z.string().max(10_000),
});

function normalizeLine(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function listFromLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => normalizeLine(line))
    .filter(Boolean);
}

export function buildLlmsTxt(input: LlmsTxtInput): string {
  const parsed = llmsTxtInputSchema.parse(input);
  const name = normalizeLine(parsed.projectName) || "Project";
  const projectUrl = normalizeLine(parsed.projectUrl);
  const summary = normalizeLine(parsed.summary);
  const docsUrl = normalizeLine(parsed.docsUrl);
  const sourceUrl = normalizeLine(parsed.sourceUrl);
  const license = normalizeLine(parsed.license);
  const rules = listFromLines(parsed.rules);

  const lines: string[] = [];
  lines.push(`# ${name}`);
  if (summary) lines.push(summary);
  lines.push("");

  lines.push("## Links");
  if (projectUrl) lines.push(`- Project: ${projectUrl}`);
  if (docsUrl) lines.push(`- Docs: ${docsUrl}`);
  if (sourceUrl) lines.push(`- Source: ${sourceUrl}`);
  if (license) lines.push(`- License: ${license}`);
  lines.push("");

  lines.push("## Guidance");
  if (rules.length === 0) {
    lines.push("- Follow public documentation and source code.");
  } else {
    rules.forEach((rule) => lines.push(`- ${rule}`));
  }

  return lines.join("\n").trim();
}
