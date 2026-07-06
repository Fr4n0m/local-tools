export type PlaceholderMode =
  | "lorem"
  | "english-ish"
  | "cat"
  | "headlines"
  | "names"
  | "emails";

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

const HEADLINE_WORDS = [
  "Launch",
  "Build",
  "Scale",
  "Design",
  "Create",
  "Ship",
  "Improve",
  "Optimize",
  "Grow",
  "Discover",
];

const NAME_WORDS = [
  "Alex Johnson",
  "Maya Chen",
  "Lucas Martín",
  "Emma Wilson",
  "Noah García",
  "Sofía Brown",
];

const EMAIL_WORDS = [
  "alex@example.com",
  "maya@example.com",
  "lucas@example.com",
  "emma@example.com",
  "noah@example.com",
  "sofia@example.com",
];

function pickDictionary(mode: PlaceholderMode): string[] {
  if (mode === "english-ish") {
    return ENGLISHISH_WORDS;
  }
  if (mode === "cat") {
    return CAT_WORDS;
  }
  if (mode === "headlines") {
    return HEADLINE_WORDS;
  }
  if (mode === "names") {
    return NAME_WORDS;
  }
  if (mode === "emails") {
    return EMAIL_WORDS;
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
  bulletMode = false,
): string {
  const safeParagraphs = Math.max(1, Math.min(50, Math.trunc(paragraphs)));
  const safeSentences = Math.max(
    1,
    Math.min(20, Math.trunc(sentencesPerParagraph)),
  );
  const safeWords = Math.max(3, Math.min(30, Math.trunc(wordsPerSentence)));
  const dictionary = pickDictionary(mode);

  if (mode === "names" || mode === "emails") {
    const count = Math.max(
      1,
      Math.min(20, Math.trunc(paragraphs * sentencesPerParagraph)),
    );
    const values = Array.from(
      { length: count },
      (_, index) => dictionary[index % dictionary.length],
    );
    return bulletMode
      ? values.map((value) => `- ${value}`).join("\n")
      : values.join("\n");
  }

  if (mode === "headlines") {
    const count = Math.max(
      1,
      Math.min(20, Math.trunc(paragraphs * sentencesPerParagraph)),
    );
    const values = Array.from({ length: count }, (_, index) => {
      const first = dictionary[index % dictionary.length];
      const second = ENGLISHISH_WORDS[index % ENGLISHISH_WORDS.length];
      const third = ENGLISHISH_WORDS[(index + 4) % ENGLISHISH_WORDS.length];
      return `${first} ${second} ${third}`;
    });
    return bulletMode
      ? values.map((value) => `- ${value}`).join("\n")
      : values.join("\n");
  }

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

  const output = blocks.join("\n\n");
  return bulletMode
    ? output
        .split(/\.\s+/)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((chunk) => `- ${chunk.replace(/\.$/, "")}.`)
        .join("\n")
    : output;
}
