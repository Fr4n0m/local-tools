"use client";

import { useSyncExternalStore } from "react";
import { Toaster } from "sileo";

function subscribeToTheme(callback: () => void) {
  const root = document.documentElement;
  const observer = new MutationObserver(callback);
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getThemeSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function NotificationHost() {
  const theme = useSyncExternalStore<"light" | "dark">(
    subscribeToTheme,
    getThemeSnapshot,
    () => "light",
  );

  return <Toaster position="top-right" theme={theme} />;
}
