"use client";

import { sileo } from "sileo";

import { sharedMessages, type Language } from "@/shared/presentation/i18n";

function resolveLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const saved = window.localStorage.getItem("localtools.language");
  return saved === "es" ? "es" : "en";
}

export function notifyCopySuccess() {
  const language = resolveLanguage();
  sileo.success({ title: sharedMessages[language].notifications.copySuccess });
}

export function notifyCopyError() {
  const language = resolveLanguage();
  sileo.error({ title: sharedMessages[language].notifications.copyError });
}
