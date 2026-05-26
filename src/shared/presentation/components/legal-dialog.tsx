"use client";

import { IconFileDescription, IconScale } from "@tabler/icons-react";
import type { Language } from "@/shared/presentation/i18n";
import en from "@/shared/presentation/i18n/legal/en.json";
import es from "@/shared/presentation/i18n/legal/es.json";

type LegalDocumentType = "privacy" | "terms";

type LegalDialogProps = {
  language: Language;
  openDoc: LegalDocumentType | null;
  onClose: () => void;
};

const legalMessages = { en, es } as const;

export function LegalDialog({ language, openDoc, onClose }: LegalDialogProps) {
  if (!openDoc) {
    return null;
  }

  const text = legalMessages[language];
  const document = text[openDoc];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 p-3 md:p-6"
      onClick={onClose}
    >
      <div
        aria-modal="true"
        className="mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col rounded-md border border-border/60 bg-background"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            {openDoc === "privacy" ? (
              <IconFileDescription size={18} />
            ) : (
              <IconScale size={18} />
            )}
            {document.title}
          </h2>
          <button
            className="rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            onClick={onClose}
            type="button"
          >
            {text.back}
          </button>
        </header>
        <div className="space-y-5 overflow-y-auto px-4 py-4 text-sm">
          {document.sections.map((section) => (
            <section className="space-y-2" key={section.title}>
              <h3 className="font-semibold">{section.title}</h3>
              {section.paragraphs?.map((paragraph) => (
                <p className="text-foreground/85" key={paragraph}>
                  {paragraph}
                </p>
              ))}
              {section.items?.length ? (
                <ul className="list-disc space-y-1 pl-5 text-foreground/85">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
        <footer className="border-t border-border/50 px-4 py-3 text-xs text-foreground/70">
          {`${text.lastUpdatedLabel}: ${text.lastUpdated}`}
        </footer>
      </div>
    </div>
  );
}
