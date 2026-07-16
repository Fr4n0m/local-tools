import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { z } from "zod";

import { extractFaviconReferences } from "@/modules/favicon-generator/domain/favicon-checker";

export const runtime = "nodejs";

const requestSchema = z.object({
  url: z.string().trim().url().max(2048),
});

const MAX_HTML_HEAD_BYTES = 1_048_576;
const MAX_TEXT_BYTES = 512_000;
const MAX_REFERENCES = 32;
const MAX_REDIRECTS = 4;
const REQUEST_TIMEOUT_MS = 8_000;

function isPrivateIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  const [a, b, c] = octets;
  if (
    octets.length !== 4 ||
    a === undefined ||
    b === undefined ||
    c === undefined
  )
    return true;
  return (
    a === 0 ||
    a === 10 ||
    (a === 100 && b >= 64 && b <= 127) ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isPrivateIp(address: string): boolean {
  if (isIP(address) === 4) return isPrivateIpv4(address);
  const normalized = address.toLowerCase().split("%")[0] ?? "";
  if (normalized.startsWith("::ffff:")) {
    const mappedIpv4 = normalized.slice("::ffff:".length);
    if (isIP(mappedIpv4) === 4) return isPrivateIpv4(mappedIpv4);
  }
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8:")
  );
}

async function assertPublicUrl(url: URL): Promise<void> {
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("unsupported-protocol");
  if (
    url.username ||
    url.password ||
    (url.port && !["80", "443"].includes(url.port))
  ) {
    throw new Error("unsafe-url");
  }
  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("private-host");
  }
  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true });
  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateIp(address))
  ) {
    throw new Error("private-host");
  }
}

async function safeFetch(startUrl: URL, init?: RequestInit): Promise<Response> {
  let current = startUrl;
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertPublicUrl(current);
    const response = await fetch(current, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        "user-agent": "LocalTools-Favicon-Checker/1.0",
        ...init?.headers,
      },
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get("location");
    if (!location) return response;
    current = new URL(location, current);
  }
  throw new Error("too-many-redirects");
}

async function readLimitedText(
  response: Response,
  maxBytes = MAX_TEXT_BYTES,
): Promise<string> {
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > maxBytes) throw new Error("response-too-large");
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let size = 0;
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error("response-too-large");
    }
    result += decoder.decode(value, { stream: true });
  }
  return result + decoder.decode();
}

async function readHtmlHead(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let size = 0;
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) return result + decoder.decode();
    size += value.byteLength;
    result += decoder.decode(value, { stream: true });
    const headEnd = result.search(/<\/head\s*>/i);
    if (headEnd >= 0) {
      await reader.cancel();
      return result.slice(0, headEnd + result.slice(headEnd).indexOf(">") + 1);
    }
    if (size > MAX_HTML_HEAD_BYTES) {
      await reader.cancel();
      throw new Error("response-too-large");
    }
  }
}

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid-url" }, { status: 400 });
    }
    const pageUrl = new URL(parsed.data.url);
    const pageResponse = await safeFetch(pageUrl, {
      headers: { accept: "text/html,application/xhtml+xml" },
    });
    if (!pageResponse.ok) {
      return NextResponse.json(
        { error: "page-unavailable", status: pageResponse.status },
        { status: 422 },
      );
    }
    const contentType = pageResponse.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml")
    ) {
      return NextResponse.json({ error: "not-html" }, { status: 422 });
    }
    const html = await readHtmlHead(pageResponse);
    const finalPageUrl = new URL(pageResponse.url || pageUrl);
    const references = extractFaviconReferences(html).slice(0, MAX_REFERENCES);
    const checks = await Promise.all(
      references.map(async (reference) => {
        try {
          const assetUrl = new URL(reference.href, finalPageUrl);
          const response = await safeFetch(assetUrl, {
            method: "GET",
            headers: { range: "bytes=0-0" },
          });
          await response.body?.cancel();
          return {
            ...reference,
            url: assetUrl.toString(),
            ok: response.ok || response.status === 206,
            status: response.status,
            contentType: response.headers.get("content-type"),
          };
        } catch {
          return {
            ...reference,
            url: reference.href,
            ok: false,
            status: null,
            contentType: null,
          };
        }
      }),
    );
    const manifestReference = references.find(
      (reference) => reference.kind === "manifest",
    );
    let manifestValid = false;
    if (manifestReference) {
      try {
        const manifestUrl = new URL(manifestReference.href, finalPageUrl);
        const manifestResponse = await safeFetch(manifestUrl, {
          headers: { accept: "application/manifest+json,application/json" },
        });
        if (manifestResponse.ok) {
          const manifest = JSON.parse(
            await readLimitedText(manifestResponse),
          ) as {
            icons?: Array<{ src?: unknown }>;
          };
          const sources = (manifest.icons ?? [])
            .map((icon) => icon.src)
            .filter(
              (source): source is string =>
                typeof source === "string" && source.length > 0,
            )
            .slice(0, 16);
          const iconChecks = await Promise.all(
            sources.map(async (source) => {
              try {
                const response = await safeFetch(new URL(source, manifestUrl), {
                  method: "GET",
                  headers: { range: "bytes=0-0" },
                });
                await response.body?.cancel();
                return response.ok || response.status === 206;
              } catch {
                return false;
              }
            }),
          );
          manifestValid = sources.length > 0 && iconChecks.every(Boolean);
        }
      } catch {
        manifestValid = false;
      }
    }
    const kinds = new Set(
      checks.filter((check) => check.ok).map((check) => check.kind),
    );
    const requiredChecksPass =
      kinds.has("icon") &&
      kinds.has("apple") &&
      kinds.has("manifest") &&
      manifestValid;
    return NextResponse.json({
      ok: requiredChecksPass && checks.every((check) => check.ok),
      pageStatus: pageResponse.status,
      checks,
      summary: {
        icon: kinds.has("icon"),
        apple: kinds.has("apple"),
        manifest: kinds.has("manifest") && manifestValid,
        config: kinds.has("config"),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "check-failed";
    const status = [
      "private-host",
      "unsafe-url",
      "unsupported-protocol",
    ].includes(message)
      ? 400
      : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
