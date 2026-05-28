"use client";

import { useEffect, useMemo, useState } from "react";
import {
  resolveInitialLanguage,
  type Language,
} from "@/shared/presentation/i18n";
import { SimplePageHeader } from "@/shared/presentation/components/simple-page-header";
import { PageDisplayControls } from "@/shared/presentation/components/page-display-controls";
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
    const onLanguageChange = () => setLanguage(resolveInitialLanguage());
    window.addEventListener("storage", onStorage);
    window.addEventListener("localtools:language-change", onLanguageChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "localtools:language-change",
        onLanguageChange,
      );
    };
  }, []);

  const text = legalMessages[language];
  const document = useMemo(() => text[docType], [docType, text]);

  return (
    <main className="page-frame min-h-screen py-6 md:py-8">
      <SimplePageHeader rightSlot={<PageDisplayControls />} />
      <header className="mb-5">
        <h1 className="text-xl font-semibold md:text-2xl">{document.title}</h1>
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
