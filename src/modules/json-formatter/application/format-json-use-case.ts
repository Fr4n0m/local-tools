import {
  formatJson,
  type JsonFormatOptions,
} from "@/modules/json-formatter/domain/format-json";

export function formatJsonUseCase(input: string, options?: JsonFormatOptions) {
  return formatJson(input, options);
}
