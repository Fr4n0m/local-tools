import type { Dispatch, SetStateAction } from "react";

export type Theme = "light" | "dark";

export function readInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("localtools.theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function setThemeWithTransition(
  setTheme: Dispatch<SetStateAction<Theme>>,
  nextTheme: Theme,
) {
  const documentWithTransition = document as Document & {
    startViewTransition?: (updateCallback: () => void) => void;
  };

  if (!documentWithTransition.startViewTransition) {
    setTheme(nextTheme);
    return;
  }

  documentWithTransition.startViewTransition(() => {
    setTheme(nextTheme);
  });
}
