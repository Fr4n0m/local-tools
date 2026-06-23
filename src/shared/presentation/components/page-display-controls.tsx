"use client";

import { useEffect, useRef, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import {
  resolveInitialLanguage,
  type Language,
} from "@/shared/presentation/i18n";
import {
  readInitialTheme,
  setThemeWithTransition,
  type Theme,
} from "@/shared/lib/theme";

export function PageDisplayControls() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const isReadyRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLanguage(resolveInitialLanguage());
      setTheme(readInitialTheme());
      isReadyRef.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isReadyRef.current) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("localtools.theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isReadyRef.current) return;
    document.documentElement.lang = language;
    window.localStorage.setItem("localtools.language", language);
    window.dispatchEvent(
      new CustomEvent("localtools:language-change", { detail: language }),
    );
  }, [language]);

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/55 bg-background/65 p-1">
      <button
        aria-label="Language"
        className="lt-button lt-button--ghost lt-button--sm"
        onClick={() => setLanguage(language === "en" ? "es" : "en")}
        type="button"
      >
        {language === "en" ? "EN" : "ES"}
      </button>
      <button
        aria-label="Theme"
        className="lt-button lt-button--ghost lt-button--sm lt-button--icon"
        onClick={() =>
          setThemeWithTransition(setTheme, theme === "light" ? "dark" : "light")
        }
        type="button"
      >
        {theme === "light" ? <IconMoon size={14} /> : <IconSun size={14} />}
      </button>
    </div>
  );
}
