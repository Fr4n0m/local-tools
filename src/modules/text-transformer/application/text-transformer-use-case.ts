import {
  capitalize,
  lowercase,
  normalizeSpaces,
  removeSpaces,
  slugify,
  trim,
  uppercase,
} from "@/modules/text-transformer/domain/transform-text";

export const textTransformerUseCase = {
  uppercase,
  lowercase,
  capitalize,
  trim,
  removeSpaces,
  normalizeSpaces,
  slugify,
};
