"use client";

import { useEffect } from "react";
import {
  LANGUAGE_STORAGE_KEY,
  resolveInitialLanguage,
} from "@/shared/presentation/i18n";

export function GlobalLanguageSync() {
  useEffect(() => {
    const sync = () => {
      document.documentElement.lang = resolveInitialLanguage();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY) sync();
    };
    sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("localtools:language-change", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("localtools:language-change", sync);
    };
  }, []);
  return null;
}
