import { z } from "zod";

export function sanitizeIntInput(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  return z
    .preprocess(
      (current) =>
        current === "" ||
        current === null ||
        current === undefined ||
        (typeof current === "number" && Number.isNaN(current))
          ? fallback
          : current,
      z.coerce.number().int().catch(fallback),
    )
    .transform((current) => Math.max(min, Math.min(max, current)))
    .parse(value);
}

export function sanitizeFloatInput(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  precision = 2,
): number {
  return z
    .preprocess(
      (current) =>
        current === "" ||
        current === null ||
        current === undefined ||
        (typeof current === "number" && Number.isNaN(current))
          ? fallback
          : current,
      z.coerce.number().finite().catch(fallback),
    )
    .transform((current) => Math.max(min, Math.min(max, current)))
    .transform((current) => Number(current.toFixed(precision)))
    .parse(value);
}
