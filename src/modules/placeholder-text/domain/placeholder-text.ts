export type PlaceholderMode = "lorem" | "english-ish" | "cat";

const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
];

const ENGLISHISH_WORDS = [
  "modern",
  "product",
  "design",
  "system",
  "workflow",
  "creative",
  "layout",
  "signal",
  "method",
  "browser",
  "module",
  "native",
  "quality",
  "faster",
  "context",
  "client",
  "simple",
  "focused",
  "builder",
  "feature",
];

const CAT_WORDS = [
  "meow",
  "purr",
  "mrrp",
  "nyan",
  "miau",
  "prrr",
  "mew",
  "rawr",
  "mrrrow",
  "brrp",
];

function pickDictionary(mode: PlaceholderMode): string[] {
  if (mode === "english-ish") {
    return ENGLISHISH_WORDS;
  }
  if (mode === "cat") {
    return CAT_WORDS;
  }
  return LOREM_WORDS;
}

function sentenceFromWords(
  words: string[],
  count: number,
  offset: number,
): string {
  const result: string[] = [];
  for (let index = 0; index < count; index += 1) {
    result.push(words[(offset + index) % words.length]);
  }
  const sentence = result.join(" ");
  return `${sentence[0].toUpperCase()}${sentence.slice(1)}.`;
}

export function generatePlaceholderText(
  mode: PlaceholderMode,
  paragraphs: number,
  sentencesPerParagraph: number,
  wordsPerSentence: number,
): string {
  const safeParagraphs = Math.max(1, Math.min(50, Math.trunc(paragraphs)));
  const safeSentences = Math.max(
    1,
    Math.min(20, Math.trunc(sentencesPerParagraph)),
  );
  const safeWords = Math.max(3, Math.min(30, Math.trunc(wordsPerSentence)));
  const dictionary = pickDictionary(mode);

  const blocks: string[] = [];
  let seed = 0;

  for (
    let paragraphIndex = 0;
    paragraphIndex < safeParagraphs;
    paragraphIndex += 1
  ) {
    const lines: string[] = [];
    for (
      let sentenceIndex = 0;
      sentenceIndex < safeSentences;
      sentenceIndex += 1
    ) {
      lines.push(sentenceFromWords(dictionary, safeWords, seed));
      seed += safeWords;
    }
    blocks.push(lines.join(" "));
  }

  return blocks.join("\n\n");
}
