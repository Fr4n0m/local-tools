"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconArrowLeft,
  IconBellOff,
  IconCircleCheck,
  IconExclamationCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { sileo } from "sileo";
import { z } from "zod";
import {
  resolveInitialLanguage,
  type Language,
} from "@/shared/presentation/i18n";
import styles from "./unsubscribe.module.css";

const tokenSchema = z.string().trim().min(1);

type Props = {
  token: string;
};

type State = "idle" | "loading" | "success" | "error";

const copy = {
  es: {
    eyebrow: "SUSCRIPCION / LOCALTOOLS",
    title: "Cancelar novedades",
    description:
      "Confirma la baja para dejar de recibir emails sobre nuevas tools, mejoras de UX y notas de version.",
    invalid: "Este enlace de baja no es valido o ha expirado.",
    button: "Confirmar baja",
    back: "Volver al inicio",
    loadingTitle: "Procesando",
    loadingDescription: "Tramitando la baja...",
    successTitle: "Baja completada",
    successDescription: "Tu suscripcion se cancelo correctamente.",
    errorTitle: "Error",
    errorDescription: "No se pudo completar la baja. Intentalo de nuevo.",
  },
  en: {
    eyebrow: "SUBSCRIPTION / LOCALTOOLS",
    title: "Cancel updates",
    description:
      "Confirm unsubscribe to stop receiving emails about new tools, UX improvements, and release notes.",
    invalid: "This unsubscribe link is invalid or has expired.",
    button: "Confirm unsubscribe",
    back: "Back to home",
    loadingTitle: "Processing",
    loadingDescription: "Handling unsubscribe...",
    successTitle: "Unsubscribed",
    successDescription: "Your subscription was canceled successfully.",
    errorTitle: "Error",
    errorDescription: "Could not complete the unsubscribe. Try again.",
  },
} satisfies Record<Language, Record<string, string>>;

export function UnsubscribeClient({ token }: Props) {
  const [language, setLanguage] = useState<Language>("en");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const parsedToken = useMemo(() => tokenSchema.safeParse(token), [token]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setLanguage(resolveInitialLanguage());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const text = copy[language];

  async function onConfirm() {
    if (state === "loading" || state === "success" || !parsedToken.success) {
      return;
    }

    setState("loading");
    setMessage(null);

    try {
      await sileo.promise(
        fetch("https://codebyfran.es/api/projects/local-tools/unsubscribe", {
          method: "POST",
          credentials: "omit",
          mode: "cors",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token: parsedToken.data }),
        }).then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            const error =
              typeof data === "object" && data && "message" in data
                ? String(data.message)
                : text.errorDescription;
            throw new Error(error);
          }
          return data;
        }),
        {
          loading: {
            title: text.loadingTitle,
            description: text.loadingDescription,
          },
          success: {
            title: text.successTitle,
            description: text.successDescription,
          },
          error: (err: unknown) => ({
            title: text.errorTitle,
            description:
              err instanceof Error ? err.message : text.errorDescription,
          }),
        },
      );
      setState("success");
      setMessage(text.successDescription);
    } catch {
      setState("error");
      setMessage(text.errorDescription);
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <p className={styles.description}>{text.description}</p>

        {!parsedToken.success ? (
          <p className={styles.alert}>
            <IconExclamationCircle size={18} aria-hidden />
            {text.invalid}
          </p>
        ) : (
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onConfirm}
              disabled={state === "loading" || state === "success"}
            >
              {state === "success" ? (
                <IconCircleCheck size={17} aria-hidden />
              ) : (
                <IconBellOff size={17} aria-hidden />
              )}
              {state === "loading" ? "..." : text.button}
            </button>
            <Link href="/">
              <IconArrowLeft size={17} aria-hidden />
              {text.back}
            </Link>
          </div>
        )}

        {message ? (
          <p
            className={`${styles.feedback} ${
              state === "success" ? styles.feedbackSuccess : ""
            }`}
          >
            {message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
