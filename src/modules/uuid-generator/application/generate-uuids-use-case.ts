import {
  formatUuidValue,
  generateUuids,
} from "@/modules/uuid-generator/domain/generate-uuids";

type GenerateUuidOptions = {
  stripHyphens?: boolean;
};

export function generateUuidsUseCase(
  amount: number,
  options: GenerateUuidOptions = {},
): string[] {
  return generateUuids(amount).map((value) =>
    formatUuidValue(value, options.stripHyphens ?? false),
  );
}
