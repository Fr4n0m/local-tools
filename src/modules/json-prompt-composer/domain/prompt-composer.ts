import { z } from "zod";

export type PromptComposerInput = {
  role: string;
  goal: string;
  context: string;
  constraints: string;
  outputFormat: string;
};

const promptComposerInputSchema = z.object({
  role: z.string().trim().min(1).max(500),
  goal: z.string().trim().min(1).max(1_000),
  context: z.string().trim().max(2_000),
  constraints: z.string().max(10_000),
  outputFormat: z.string().trim().min(1).max(500),
});

function splitLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function buildPromptJson(input: PromptComposerInput): string {
  const parsed = promptComposerInputSchema.parse(input);
  const payload = {
    role: parsed.role.trim(),
    goal: parsed.goal.trim(),
    context: parsed.context.trim(),
    constraints: splitLines(parsed.constraints),
    output_format: parsed.outputFormat.trim(),
  };

  return JSON.stringify(payload, null, 2);
}
