export type SubscriptionStatus = "confirmed" | "error";

export function normalizeSubscriptionStatus(
  value: string | string[] | undefined,
): SubscriptionStatus | null {
  const candidate = Array.isArray(value) ? value[0] : value;

  return candidate === "confirmed" || candidate === "error" ? candidate : null;
}
