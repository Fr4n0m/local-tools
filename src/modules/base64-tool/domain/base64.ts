function toUtf8Bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function fromUtf8Bytes(value: Uint8Array): string {
  return new TextDecoder().decode(value);
}

function bytesToBinary(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return binary;
}

function binaryToBytes(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function normalizeBase64(input: string): string {
  return input.replace(/\s+/g, "");
}

export function normalizeBase64Url(input: string): string {
  const normalized = normalizeBase64(input)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const remainder = normalized.length % 4;
  if (remainder === 0) {
    return normalized;
  }
  return normalized.padEnd(normalized.length + (4 - remainder), "=");
}

export function isValidBase64(input: string): boolean {
  const normalized = normalizeBase64(input);
  if (normalized.length === 0 || normalized.length % 4 !== 0) {
    return false;
  }
  return /^[A-Za-z0-9+/]+={0,2}$/.test(normalized);
}

export function isValidBase64Url(input: string): boolean {
  const normalized = normalizeBase64(input);
  if (normalized.length === 0) {
    return false;
  }
  return /^[A-Za-z0-9\-_]+=*$/.test(normalized);
}

export function encodeBase64(input: string): string {
  const bytes = toUtf8Bytes(input);
  return btoa(bytesToBinary(bytes));
}

export function encodeBase64Url(input: string): string {
  return encodeBase64(input)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function decodeBase64(
  input: string,
): { ok: true; value: string } | { ok: false } {
  try {
    const binary = atob(normalizeBase64(input));
    return { ok: true, value: fromUtf8Bytes(binaryToBytes(binary)) };
  } catch {
    return { ok: false };
  }
}

export function decodeBase64Url(
  input: string,
): { ok: true; value: string } | { ok: false } {
  try {
    const binary = atob(normalizeBase64Url(input));
    return { ok: true, value: fromUtf8Bytes(binaryToBytes(binary)) };
  } catch {
    return { ok: false };
  }
}

export function toDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${normalizeBase64(base64)}`;
}

export function parseDataUrl(
  input: string,
): { ok: true; mimeType: string; base64: string } | { ok: false } {
  const match = input.match(/^data:([^;,]+)?;base64,(.+)$/i);
  if (!match) {
    return { ok: false };
  }

  return {
    ok: true,
    mimeType: match[1] || "text/plain",
    base64: normalizeBase64(match[2]),
  };
}
