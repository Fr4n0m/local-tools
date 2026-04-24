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
