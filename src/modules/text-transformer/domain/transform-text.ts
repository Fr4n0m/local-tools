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
