export function normalizeUuidAmount(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 1;
  }

  return Math.min(100, Math.max(1, Math.floor(amount)));
}

export function generateUuids(amount: number): string[] {
  const safeAmount = normalizeUuidAmount(amount);
  return Array.from({ length: safeAmount }, () => crypto.randomUUID());
}

export function formatUuidValue(value: string, stripHyphens: boolean): string {
  if (!stripHyphens) {
    return value;
  }

  return value.replaceAll("-", "");
}
