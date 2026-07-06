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

export function generateUuidsUseCase(
  amount: number,
  options: GenerateUuidOptions = {},
): string[] {
  return generateUuids(amount, options.version ?? "v4").map((value) =>
    formatUuidValue(
      value,
      options.stripHyphens ?? false,
      options.uppercase ?? false,
    ),
  );
}
