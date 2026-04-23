import en from "./en.json";
import es from "./es.json";

export type Language = "en" | "es";

export const sharedMessages = {
  en,
  es,
} as const;

export function resolveInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const saved = window.localStorage.getItem("localtools.language");
  if (saved === "en" || saved === "es") {
    return saved;
  }

  const navigatorLanguage = window.navigator.language.toLowerCase();
  return navigatorLanguage.startsWith("es") ? "es" : "en";
}
