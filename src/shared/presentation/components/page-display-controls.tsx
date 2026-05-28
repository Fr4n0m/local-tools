"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import {
  resolveInitialLanguage,
  type Language,
} from "@/shared/presentation/i18n";

type Theme = "light" | "dark";
function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const storedTheme = window.localStorage.getItem("localtools.theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function PageDisplayControls() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLanguage(resolveInitialLanguage());
      setTheme(readInitialTheme());
      setIsReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("localtools.theme", theme);
  }, [theme, isReady]);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.lang = language;
    window.localStorage.setItem("localtools.language", language);
    window.dispatchEvent(
      new CustomEvent("localtools:language-change", { detail: language }),
    );
  }, [language, isReady]);

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/55 bg-background/65 p-1">
      <button
        aria-label="Language"
        className="rounded-md px-2 py-1 text-xs font-medium hover:bg-secondary"
        onClick={() => setLanguage(language === "en" ? "es" : "en")}
        type="button"
      >
        {language === "en" ? "EN" : "ES"}
      </button>
      <button
        aria-label="Theme"
        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        type="button"
      >
        {theme === "light" ? <IconMoon size={14} /> : <IconSun size={14} />}
      </button>
    </div>
  );
}
