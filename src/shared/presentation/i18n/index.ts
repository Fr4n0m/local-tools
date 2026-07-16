import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import de from "./de.json";
import it from "./it.json";

export const LANGUAGE_OPTIONS = [
  { code: "es", label: "Español", flag: "/assets/flags/es.svg" },
  { code: "en", label: "English", flag: "/assets/flags/gb.svg" },
  { code: "fr", label: "Français", flag: "/assets/flags/fr.svg" },
  { code: "de", label: "Deutsch", flag: "/assets/flags/de.svg" },
  { code: "it", label: "Italiano", flag: "/assets/flags/it.svg" },
] as const;

export type Language = (typeof LANGUAGE_OPTIONS)[number]["code"];
export const LANGUAGE_STORAGE_KEY = "localtools.language";
export const SUPPORTED_LANGUAGES: readonly Language[] = LANGUAGE_OPTIONS.map(
  ({ code }) => code,
);

export const sharedMessages = {
  en,
  es,
  fr,
  de,
  it,
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
