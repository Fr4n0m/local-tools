"use client";

import { useEffect, useRef, useState } from "react";
import {
  resolveInitialLanguage,
  type Language,
} from "@/shared/presentation/i18n";
import {
  readInitialTheme,
  setThemeWithTransition,
  type Theme,
} from "@/shared/lib/theme";

const LANGUAGE_FLAGS: Record<Language, string> = {
  en: "/assets/flags/gb.svg",
  es: "/assets/flags/es.svg",
};

const THEME_ICONS: Record<Theme, string> = {
  light: "/assets/icons/moon.svg",
  dark: "/assets/icons/sun.svg",
};

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
    <div className="page-display-control-group flex items-center rounded-lg border border-border/55 bg-background/65 p-1">
      <button
        aria-label={
          language === "en" ? "Switch to Spanish" : "Switch to English"
        }
        className="lt-button lt-button--ghost page-display-control-button"
        onClick={() => setLanguage(language === "en" ? "es" : "en")}
        type="button"
      >
        <img
          alt=""
          aria-hidden="true"
          className="page-display-control-flag"
          src={LANGUAGE_FLAGS[language]}
        />
      </button>
      <button
        aria-label="Theme"
        className="lt-button lt-button--ghost lt-button--icon page-display-control-button page-display-control-button--icon"
        onClick={() =>
          setThemeWithTransition(setTheme, theme === "light" ? "dark" : "light")
        }
        type="button"
      >
        <img
          alt=""
          aria-hidden="true"
          className="page-display-control-theme-icon"
          src={THEME_ICONS[theme]}
        />
      </button>
    </div>
  );
}
