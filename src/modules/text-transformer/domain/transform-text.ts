export function uppercase(input: string): string {
  return input.toUpperCase();
}

export function lowercase(input: string): string {
  return input.toLowerCase();
}

export function capitalize(input: string): string {
  return input
    .toLowerCase()
    .split(" ")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function titleCase(input: string): string {
  return normalizeSpaces(input)
    .split(" ")
    .map(
      (chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase(),
    )
    .join(" ");
}

export function trim(input: string): string {
  return input.trim();
}

export function removeSpaces(input: string): string {
  return input.replace(/\s+/g, "");
}

export function normalizeSpaces(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function slugify(input: string): string {
  return normalizeSpaces(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function tokenizeWords(input: string): string[] {
  return slugify(input).split("-").filter(Boolean);
}

export function camelCase(input: string): string {
  const words = tokenizeWords(input);
  return words
    .map((word, index) =>
      index === 0 ? word : `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
    )
    .join("");
}

export function pascalCase(input: string): string {
  return tokenizeWords(input)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join("");
}

export function snakeCase(input: string): string {
  return tokenizeWords(input).join("_");
}

export function kebabCase(input: string): string {
  return tokenizeWords(input).join("-");
}

export function constantCase(input: string): string {
  return tokenizeWords(input).join("_").toUpperCase();
}

export function alternatingCase(input: string): string {
  let toggle = true;
  return Array.from(input)
    .map((char) => {
      if (!/[a-záéíóúüñ]/i.test(char)) return char;
      const next = toggle ? char.toUpperCase() : char.toLowerCase();
      toggle = !toggle;
      return next;
    })
    .join("");
}
