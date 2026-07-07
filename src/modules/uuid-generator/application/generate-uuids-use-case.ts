import { z } from "zod";

import {
  formatUuidValue,
  generateUuids,
  type UuidVersion,
} from "@/modules/uuid-generator/domain/generate-uuids";

type GenerateUuidOptions = {
  stripHyphens?: boolean;
  uppercase?: boolean;
  version?: UuidVersion;
};

const generateUuidsInputSchema = z.object({
  amount: z.coerce.number().int().catch(1),
  options: z
    .object({
      stripHyphens: z.boolean().optional(),
      uppercase: z.boolean().optional(),
      version: z.enum(["v4", "v7", "nil"]).optional(),
    })
    .default({}),
});

export function generateUuidsUseCase(
  amount: number,
  options: GenerateUuidOptions = {},
): string[] {
  const parsed = generateUuidsInputSchema.parse({ amount, options });
  return generateUuids(parsed.amount, parsed.options.version ?? "v4").map(
    (value) =>
      formatUuidValue(
        value,
        parsed.options.stripHyphens ?? false,
        parsed.options.uppercase ?? false,
      ),
  );
}
