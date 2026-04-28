export type PromptComposerInput = {
  role: string;
  goal: string;
  context: string;
  constraints: string;
  outputFormat: string;
};

function splitLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function buildPromptJson(input: PromptComposerInput): string {
  const payload = {
    role: input.role.trim(),
    goal: input.goal.trim(),
    context: input.context.trim(),
    constraints: splitLines(input.constraints),
    output_format: input.outputFormat.trim(),
  };

  return JSON.stringify(payload, null, 2);
}
