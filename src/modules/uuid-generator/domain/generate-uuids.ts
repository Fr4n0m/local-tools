export function generateUuids(amount: number): string[] {
  return Array.from({ length: amount }, () => crypto.randomUUID());
}
