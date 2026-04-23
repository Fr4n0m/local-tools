export function encodeUrl(input: string): string {
  return encodeURIComponent(input);
}

export function decodeUrl(
  input: string,
): { ok: true; value: string } | { ok: false } {
  try {
    return { ok: true, value: decodeURIComponent(input) };
  } catch {
    return { ok: false };
  }
}
