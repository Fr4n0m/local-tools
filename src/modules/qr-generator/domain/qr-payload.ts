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

function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function buildQrPayload(input: QrBuildInput): string {
  if (input.type === "url" || input.type === "text") {
    return input.value.trim();
  }

  if (input.type === "email") {
    const email = input.email.trim();
    const params = new URLSearchParams();
    if (input.subject?.trim()) params.set("subject", input.subject.trim());
    if (input.body?.trim()) params.set("body", input.body.trim());
    const query = params.toString();
    return `mailto:${email}${query ? `?${query}` : ""}`;
  }

  const ssid = escapeWifiValue(input.wifi.ssid.trim());
  const password = escapeWifiValue(input.wifi.password.trim());
  const hidden = input.wifi.hidden ? "true" : "false";

  if (input.wifi.encryption === "nopass") {
    return `WIFI:T:nopass;S:${ssid};H:${hidden};;`;
  }

  return `WIFI:T:${input.wifi.encryption};S:${ssid};P:${password};H:${hidden};;`;
}

export function isQrPayloadValid(payload: string): boolean {
  return payload.trim().length > 0;
}
