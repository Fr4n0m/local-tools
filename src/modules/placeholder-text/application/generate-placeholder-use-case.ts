import {
  generatePlaceholderText,
  type PlaceholderMode,
} from "@/modules/placeholder-text/domain/placeholder-text";

export function generatePlaceholderUseCase(params: {
  mode: PlaceholderMode;
  paragraphs: number;
  sentencesPerParagraph: number;
  wordsPerSentence: number;
}): string {
  return generatePlaceholderText(
    params.mode,
    params.paragraphs,
    params.sentencesPerParagraph,
    params.wordsPerSentence,
  );
}
