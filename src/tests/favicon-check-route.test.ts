import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:dns/promises", () => {
  const lookup = vi
    .fn()
    .mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
  return { default: { lookup }, lookup };
});

import { POST } from "@/app/api/favicon-check/route";

function request(url: unknown): Request {
  return new Request("https://localtools.app/api/favicon-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

describe("favicon check route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects invalid and private destinations", async () => {
    expect((await POST(request("not-a-url"))).status).toBe(400);
    expect((await POST(request("http://127.0.0.1"))).status).toBe(400);
  });

  it("checks required markup, manifest JSON, and manifest icons", async () => {
    const html = [
      '<link rel="icon" href="/favicon.ico" />',
      '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
      '<link rel="manifest" href="/site.webmanifest" />',
    ].join("\n");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input);
        const headers = init?.headers as Record<string, string> | undefined;
        if (url.endsWith("/")) {
          return new Response(html, {
            status: 200,
            headers: { "content-type": "text/html" },
          });
        }
        if (url.endsWith("site.webmanifest") && !headers?.range) {
          return new Response(
            JSON.stringify({
              icons: [{ src: "/android-chrome-192x192.png" }],
            }),
            {
              status: 200,
              headers: { "content-type": "application/manifest+json" },
            },
          );
        }
        return new Response(new Uint8Array([0]), {
          status: 200,
          headers: { "content-type": "image/png" },
        });
      }),
    );

    const response = await POST(request("https://example.com"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      summary: { icon: true, apple: true, manifest: true },
    });
  });

  it("checks a large Next.js page by reading only its head", async () => {
    const head = [
      "<html><head>",
      '<link rel="icon" href="/favicon.ico" />',
      '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
      '<link rel="manifest" href="/site.webmanifest" />',
      "</head><body>",
    ].join("");
    const html = `${head}${"x".repeat(950_000)}</body></html>`;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input);
        const headers = init?.headers as Record<string, string> | undefined;
        if (url.endsWith("/")) {
          return new Response(html, {
            status: 200,
            headers: {
              "content-length": String(html.length),
              "content-type": "text/html",
            },
          });
        }
        if (url.endsWith("site.webmanifest") && !headers?.range) {
          return Response.json({
            icons: [{ src: "/android-chrome-192x192.png" }],
          });
        }
        return new Response(new Uint8Array([0]), {
          status: 200,
          headers: { "content-type": "image/png" },
        });
      }),
    );

    const response = await POST(request("https://example.com"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
  });
});
