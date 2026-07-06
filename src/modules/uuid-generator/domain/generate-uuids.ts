export function normalizeUuidAmount(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 1;
  }

  return Math.min(100, Math.max(1, Math.floor(amount)));
}

export type UuidVersion = "v4" | "v7" | "nil";

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

export function generateUuidV4(): string {
  return crypto.randomUUID();
}

export function generateUuidV7(): string {
  const bytes = getRandomBytes(16);
  const timestamp = Date.now();

  bytes[0] = Math.floor(timestamp / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(timestamp / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(timestamp / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(timestamp / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(timestamp / 2 ** 8) & 0xff;
  bytes[5] = timestamp & 0xff;

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return bytesToUuid(bytes);
}

export function generateNilUuid(): string {
  return "00000000-0000-0000-0000-000000000000";
}

export function generateUuids(
  amount: number,
  version: UuidVersion = "v4",
): string[] {
  const safeAmount = normalizeUuidAmount(amount);
  const generator =
    version === "v7"
      ? generateUuidV7
      : version === "nil"
        ? generateNilUuid
        : generateUuidV4;
  return Array.from({ length: safeAmount }, () => generator());
}

export function formatUuidValue(
  value: string,
  stripHyphens: boolean,
  uppercase = false,
): string {
  const normalized = stripHyphens ? value.replaceAll("-", "") : value;
  if (uppercase) {
    return normalized.toUpperCase();
  }
  return normalized;
}
