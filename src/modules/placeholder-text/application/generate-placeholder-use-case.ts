import { z } from "zod";

import {
  generatePlaceholderText,
  type PlaceholderMode,
} from "@/modules/placeholder-text/domain/placeholder-text";

const placeholderInputSchema = z.object({
  mode: z.enum(["lorem", "english-ish", "cat", "headlines", "names", "emails"]),
  paragraphs: z.coerce.number().int().catch(3),
  sentencesPerParagraph: z.coerce.number().int().catch(4),
  wordsPerSentence: z.coerce.number().int().catch(10),
  bulletMode: z.boolean().optional(),
});

export function generatePlaceholderUseCase(params: {
  mode: PlaceholderMode;
  paragraphs: number;
  sentencesPerParagraph: number;
  wordsPerSentence: number;
  bulletMode?: boolean;
}): string {
  const parsed = placeholderInputSchema.parse(params);
  return generatePlaceholderText(
    parsed.mode,
    parsed.paragraphs,
    parsed.sentencesPerParagraph,
    parsed.wordsPerSentence,
    parsed.bulletMode ?? false,
  );
}
