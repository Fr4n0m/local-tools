function toUtf8Bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function fromUtf8Bytes(value: Uint8Array): string {
  return new TextDecoder().decode(value);
}

export function encodeBase64(input: string): string {
  const bytes = toUtf8Bytes(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function decodeBase64(
  input: string,
): { ok: true; value: string } | { ok: false } {
  try {
    const binary = atob(input);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { ok: true, value: fromUtf8Bytes(bytes) };
  } catch {
    return { ok: false };
  }
}
