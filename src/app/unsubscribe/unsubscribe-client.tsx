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
import { SubscriptionStatusCard } from "@/app/subscription/components/subscription-status-card";
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
    eyebrow: "SUSCRIPCIÓN / LOCALTOOLS",
    title: "Cancelar novedades",
    description:
      "Confirma la baja para dejar de recibir emails sobre nuevas tools, mejoras de UX y notas de versión.",
    invalidTitle: "Enlace no válido",
    invalid: "Este enlace de baja no es válido o ha expirado.",
    button: "Confirmar baja",
    back: "Volver a LocalTools",
    loadingTitle: "Procesando",
    loadingDescription: "Tramitando la baja...",
    successTitle: "Baja completada",
    successDescription: "Tu suscripción se canceló correctamente.",
    errorTitle: "No se pudo completar",
    errorDescription: "No se pudo completar la baja. Inténtalo de nuevo.",
  },
  en: {
    eyebrow: "SUBSCRIPTION / LOCALTOOLS",
    title: "Cancel updates",
    description:
      "Confirm unsubscribe to stop receiving emails about new tools, UX improvements, and release notes.",
    invalidTitle: "Invalid link",
    invalid: "This unsubscribe link is invalid or has expired.",
    button: "Confirm unsubscribe",
    back: "Back to LocalTools",
    loadingTitle: "Processing",
    loadingDescription: "Handling unsubscribe...",
    successTitle: "Unsubscribed",
    successDescription: "Your subscription was canceled successfully.",
    errorTitle: "Could not unsubscribe",
    errorDescription: "Could not complete the unsubscribe. Try again.",
  },
  fr: {
    eyebrow: "ABONNEMENT / LOCALTOOLS",
    title: "Se désabonner des actualités",
    description:
      "Confirmez votre désabonnement pour ne plus recevoir d’e-mails sur les nouveaux outils, les améliorations UX et les notes de version.",
    invalidTitle: "Lien non valide",
    invalid: "Ce lien de désabonnement n’est pas valide ou a expiré.",
    button: "Confirmer le désabonnement",
    back: "Retour à LocalTools",
    loadingTitle: "Traitement en cours",
    loadingDescription: "Désabonnement en cours...",
    successTitle: "Désabonnement confirmé",
    successDescription: "Votre abonnement a bien été annulé.",
    errorTitle: "Échec du désabonnement",
    errorDescription: "Impossible de vous désabonner. Réessayez.",
  },
  de: {
    eyebrow: "ABONNEMENT / LOCALTOOLS",
    title: "Neuigkeiten abbestellen",
    description:
      "Bestätigen Sie die Abmeldung, um keine E-Mails mehr über neue Tools, UX-Verbesserungen und Versionshinweise zu erhalten.",
    invalidTitle: "Ungültiger Link",
    invalid: "Dieser Abmeldelink ist ungültig oder abgelaufen.",
    button: "Abmeldung bestätigen",
    back: "Zurück zu LocalTools",
    loadingTitle: "Wird verarbeitet",
    loadingDescription: "Abmeldung wird verarbeitet...",
    successTitle: "Abgemeldet",
    successDescription: "Ihr Abonnement wurde erfolgreich beendet.",
    errorTitle: "Abmeldung fehlgeschlagen",
    errorDescription:
      "Die Abmeldung konnte nicht abgeschlossen werden. Versuchen Sie es erneut.",
  },
  it: {
    eyebrow: "ISCRIZIONE / LOCALTOOLS",
    title: "Annulla gli aggiornamenti",
    description:
      "Conferma la disiscrizione per non ricevere più e-mail su nuovi strumenti, miglioramenti UX e note di versione.",
    invalidTitle: "Link non valido",
    invalid: "Questo link di disiscrizione non è valido o è scaduto.",
    button: "Conferma disiscrizione",
    back: "Torna a LocalTools",
    loadingTitle: "Elaborazione in corso",
    loadingDescription: "Disiscrizione in corso...",
    successTitle: "Disiscrizione completata",
    successDescription: "La tua iscrizione è stata annullata correttamente.",
    errorTitle: "Disiscrizione non riuscita",
    errorDescription: "Impossibile completare la disiscrizione. Riprova.",
  },
} satisfies Record<Language, Record<string, string>>;

export function UnsubscribeClient({ token }: Props) {
  const [language, setLanguage] = useState<Language>("en");
  const [state, setState] = useState<State>("idle");
  const parsedToken = useMemo(() => tokenSchema.safeParse(token), [token]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setLanguage(resolveInitialLanguage());
    }, 0);
    const syncLanguage = () => setLanguage(resolveInitialLanguage());
    const onStorage = (event: StorageEvent) => {
      if (event.key === "localtools.language") syncLanguage();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("localtools:language-change", syncLanguage);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("localtools:language-change", syncLanguage);
    };
  }, []);

  const text = copy[language];
  const isInvalid = !parsedToken.success;
  const isSuccess = state === "success";
  const isLoading = state === "loading";
  const isError = state === "error";

  async function onConfirm() {
    if (isLoading || isSuccess || !parsedToken.success) return;

    setState("loading");

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
    } catch {
      setState("error");
    }
  }

  const title = isInvalid
    ? text.invalidTitle
    : isSuccess
      ? text.successTitle
      : isLoading
        ? text.loadingTitle
        : isError
          ? text.errorTitle
          : text.title;
  const description = isInvalid
    ? text.invalid
    : isSuccess
      ? text.successDescription
      : isLoading
        ? text.loadingDescription
        : isError
          ? text.errorDescription
          : text.description;
  const icon = isSuccess ? (
    <IconCircleCheck aria-hidden />
  ) : isInvalid || isError ? (
    <IconExclamationCircle aria-hidden />
  ) : (
    <IconBellOff aria-hidden />
  );

  return (
    <main className={styles.shell}>
      <div
        className={styles.content}
        aria-live={isLoading || isSuccess ? "polite" : undefined}
      >
        <SubscriptionStatusCard
          icon={icon}
          eyebrow={text.eyebrow}
          title={title}
          titleAs="h1"
          description={description}
          descriptionRole={isInvalid || isError ? "alert" : undefined}
          tone={
            isInvalid || isError ? "error" : isSuccess ? "success" : "default"
          }
        >
          {!isInvalid && !isSuccess ? (
            <button type="button" onClick={onConfirm} disabled={isLoading}>
              <IconBellOff size={17} aria-hidden />
              {isLoading ? text.loadingTitle : text.button}
            </button>
          ) : null}
          <Link href="/">
            <IconArrowLeft size={17} aria-hidden />
            {text.back}
          </Link>
        </SubscriptionStatusCard>
      </div>
    </main>
  );
}
