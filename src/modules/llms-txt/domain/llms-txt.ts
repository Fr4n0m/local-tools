export type LlmsTxtInput = {
  projectName: string;
  projectUrl: string;
  summary: string;
  docsUrl: string;
  sourceUrl: string;
  license: string;
  rules: string;
};

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
  const name = normalizeLine(input.projectName) || "Project";
  const projectUrl = normalizeLine(input.projectUrl);
  const summary = normalizeLine(input.summary);
  const docsUrl = normalizeLine(input.docsUrl);
  const sourceUrl = normalizeLine(input.sourceUrl);
  const license = normalizeLine(input.license);
  const rules = listFromLines(input.rules);

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
