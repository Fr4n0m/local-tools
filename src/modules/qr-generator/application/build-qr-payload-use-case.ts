import {
  buildQrPayload,
  isQrPayloadValid,
  type QrBuildInput,
} from "@/modules/qr-generator/domain/qr-payload";

export type BuildQrPayloadResult =
  | { ok: true; value: string }
  | { ok: false; error: "empty_payload" };

export function buildQrPayloadUseCase(
  input: QrBuildInput,
): BuildQrPayloadResult {
  const payload = buildQrPayload(input);

  if (!isQrPayloadValid(payload)) {
    return { ok: false, error: "empty_payload" };
  }

  return { ok: true, value: payload };
}
