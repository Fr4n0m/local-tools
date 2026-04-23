import { generateUuids } from "@/modules/uuid-generator/domain/generate-uuids";

export function generateUuidsUseCase(amount: number): string[] {
  return generateUuids(amount);
}
