import { formatJson } from "@/modules/json-formatter/domain/format-json";

export function formatJsonUseCase(input: string) {
  return formatJson(input);
}
