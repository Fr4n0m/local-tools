import { z } from "zod";

export type QrType = "url" | "text" | "wifi" | "email";

export type WifiQrInput = {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
};

export type QrBuildInput =
  | { type: "url"; value: string }
  | { type: "text"; value: string }
  | { type: "email"; email: string; subject?: string; body?: string }
  | { type: "wifi"; wifi: WifiQrInput };

const qrInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("url"),
    value: z.string().trim().max(4096),
  }),
  z.object({
    type: z.literal("text"),
    value: z.string().max(4096),
  }),
  z.object({
    type: z.literal("email"),
    email: z.string().trim().email().max(320),
    subject: z.string().max(240).optional(),
    body: z.string().max(4000).optional(),
  }),
  z.object({
    type: z.literal("wifi"),
    wifi: z.object({
      ssid: z.string().trim().max(128),
      password: z.string().max(128),
      encryption: z.enum(["WPA", "WEP", "nopass"]),
      hidden: z.boolean(),
    }),
  }),
]);

function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function buildQrPayload(input: QrBuildInput): string {
  const parsed = qrInputSchema.parse(input);

  if (parsed.type === "url" || parsed.type === "text") {
    return parsed.value.trim();
  }

  if (parsed.type === "email") {
    const email = parsed.email.trim();
    const params = new URLSearchParams();
    if (parsed.subject?.trim()) params.set("subject", parsed.subject.trim());
    if (parsed.body?.trim()) params.set("body", parsed.body.trim());
    const query = params.toString();
    return `mailto:${email}${query ? `?${query}` : ""}`;
  }

  const ssid = escapeWifiValue(parsed.wifi.ssid.trim());
  const password = escapeWifiValue(parsed.wifi.password.trim());
  const hidden = parsed.wifi.hidden ? "true" : "false";

  if (parsed.wifi.encryption === "nopass") {
    return `WIFI:T:nopass;S:${ssid};H:${hidden};;`;
  }

  return `WIFI:T:${parsed.wifi.encryption};S:${ssid};P:${password};H:${hidden};;`;
}

export function isQrPayloadValid(payload: string): boolean {
  return payload.trim().length > 0;
}
