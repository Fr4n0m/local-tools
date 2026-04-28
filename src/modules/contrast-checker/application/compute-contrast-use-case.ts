import {
  computeContrast,
  type ContrastResult,
} from "@/modules/contrast-checker/domain/contrast";

export type ComputeContrastUseCaseResult =
  | { ok: true; value: ContrastResult }
  | { ok: false; error: "invalid_color" };

export function computeContrastUseCase(
  foregroundHex: string,
  backgroundHex: string,
): ComputeContrastUseCaseResult {
  const result = computeContrast(foregroundHex, backgroundHex);
  if (!result) {
    return { ok: false, error: "invalid_color" };
  }
  return { ok: true, value: result };
}
