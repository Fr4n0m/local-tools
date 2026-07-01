import en from "./en.json";
import es from "./es.json";

export type Language = "en" | "es";
export const LANGUAGE_STORAGE_KEY = "localtools.language";
export const SUPPORTED_LANGUAGES: readonly Language[] = ["en", "es"];

export const sharedMessages = {
  en,
  es,
} as const;

export function resolvePreferredLanguage(
  savedLanguage: string | null,
  browserLanguage: string | null,
): Language {
  if (SUPPORTED_LANGUAGES.includes(savedLanguage as Language)) {
    return savedLanguage as Language;
  }
  const primaryLanguage = browserLanguage?.toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGES.includes(primaryLanguage as Language)
    ? (primaryLanguage as Language)
    : "en";
}

export function resolveInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  return resolvePreferredLanguage(
    window.localStorage.getItem(LANGUAGE_STORAGE_KEY),
    window.navigator.language,
  );
}
