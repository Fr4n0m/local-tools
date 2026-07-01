"use client";

import { sileo } from "sileo";

import {
  resolveInitialLanguage,
  sharedMessages,
  type Language,
} from "@/shared/presentation/i18n";

function resolveLanguage(): Language {
  return resolveInitialLanguage();
}

function t(key: keyof (typeof sharedMessages)["en"]["notifications"]): string {
  return sharedMessages[resolveLanguage()].notifications[key];
}

export function notifyCopySuccess() {
  sileo.success({ title: t("copySuccess") });
}

export function notifyCopyError() {
  sileo.error({ title: t("copyError") });
}

export function notifyDownloadSuccess(filename?: string) {
  sileo.success({
    title: filename
      ? `${filename} — ${t("downloadSuccess")}`
      : t("downloadSuccess"),
  });
}

export function notifyDownloadError() {
  sileo.error({ title: t("downloadError") });
}

export function notifySuccess(message?: string) {
  sileo.success({ title: message ?? t("processSuccess") });
}

export function notifyError(message?: string) {
  sileo.error({ title: message ?? t("processError") });
}
