export function splitParagraphs(input: string): string[] {
  return input
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function estimateReadMinutes(input: string): number {
  const words = input.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  return Math.max(1, Math.ceil(words / 220));
}
