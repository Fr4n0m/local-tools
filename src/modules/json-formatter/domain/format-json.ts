export function formatJson(
  input: string,
): { ok: true; value: string } | { ok: false } {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, value: JSON.stringify(parsed, null, 2) };
  } catch {
    return { ok: false };
  }
}
