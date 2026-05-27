"use client";

import { useEffect, useMemo, useState } from "react";
import { IconFileDescription, IconScale } from "@tabler/icons-react";
import {
  resolveInitialLanguage,
  type Language,
} from "@/shared/presentation/i18n";
import en from "@/shared/presentation/i18n/legal/en.json";
import es from "@/shared/presentation/i18n/legal/es.json";

type LegalDocumentType = "privacy" | "terms";

type LegalPageProps = {
  docType: LegalDocumentType;
};

const legalMessages = { en, es } as const;

export function LegalPage({ docType }: LegalPageProps) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLanguage(resolveInitialLanguage());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "localtools.language") {
        setLanguage(resolveInitialLanguage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const text = legalMessages[language];
  const document = useMemo(() => text[docType], [docType, text]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-4 md:p-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          {docType === "privacy" ? (
            <IconFileDescription size={20} />
          ) : (
            <IconScale size={20} />
          )}
          {document.title}
        </h1>
        <div className="flex items-center gap-2">
          <button
            className={`rounded-md border px-2.5 py-1 text-xs ${language === "es" ? "bg-secondary" : ""}`}
            onClick={() => setLanguage("es")}
            type="button"
          >
            ES
          </button>
          <button
            className={`rounded-md border px-2.5 py-1 text-xs ${language === "en" ? "bg-secondary" : ""}`}
            onClick={() => setLanguage("en")}
            type="button"
          >
            EN
          </button>
        </div>
      </header>

      <section className="space-y-5 rounded-xl border border-border/60 dark:border-white/22 bg-background/80 p-4 md:p-6">
        {document.sections.map((section) => (
          <article className="space-y-2" key={section.title}>
            <h2 className="text-base font-semibold">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p className="text-sm text-foreground/85" key={paragraph}>
                {paragraph}
              </p>
            ))}
            {section.items?.length ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/85">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <footer className="mt-4 text-xs text-foreground/70">
        {`${text.lastUpdatedLabel}: ${text.lastUpdated}`}
      </footer>
    </main>
  );
}
