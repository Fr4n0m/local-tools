"use client";

import { IconHeart } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  resolveInitialLanguage,
  sharedMessages,
  type Language,
} from "@/shared/presentation/i18n";

type Density = "comfortable" | "compact";

export function GlobalFooter() {
  const [language, setLanguage] = useState<Language>(() =>
    typeof window === "undefined" ? "en" : resolveInitialLanguage(),
  );
  const [density, setDensity] = useState<Density>(() => {
    if (typeof window === "undefined") {
      return "comfortable";
    }
    const storedDensity = window.localStorage.getItem("localtools.density");
    return storedDensity === "compact" ? "compact" : "comfortable";
  });

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key !== "localtools.language" &&
        event.key !== "localtools.density"
      ) {
        return;
      }
      if (event.key === "localtools.language") {
        setLanguage(resolveInitialLanguage());
      }
      if (event.key === "localtools.density") {
        setDensity(event.newValue === "compact" ? "compact" : "comfortable");
      }
    };
    const onDensityChange = (event: Event) => {
      const customEvent = event as CustomEvent<Density>;
      setDensity(customEvent.detail === "compact" ? "compact" : "comfortable");
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("localtools:density-change", onDensityChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("localtools:density-change", onDensityChange);
    };
  }, []);

  if (density === "compact") {
    return null;
  }

  const text = sharedMessages[language];

  return (
    <footer className="w-full border-t border-border/45 bg-panel/30 px-4 py-5 text-sm text-foreground/85 md:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-[1.15fr_1fr_1fr]">
        <section className="flex min-h-44 flex-col justify-between rounded-xl border border-border/55 bg-background/55 p-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold">{text.footer.suggestTitle}</p>
            <p className="text-xs font-semibold text-foreground/80">
              {text.footer.logoPlaceholder}
            </p>
          </div>
          <div className="space-y-3">
            <a
              className="inline-flex h-8 items-center gap-2 rounded-md border border-border/60 bg-background px-2.5 text-[11px] font-semibold hover:bg-secondary"
              href="#newsletter-banner"
            >
              <IconHeart size={15} />
              {text.footer.suggestCta}
            </a>
            <p className="text-xs text-foreground/70">
              {text.footer.brandLine}
            </p>
          </div>
        </section>

        <section className="flex min-h-44 flex-col rounded-xl border border-border/55 bg-background/55 p-4">
          <p className="mb-3 text-sm font-semibold">{text.footer.tagsTitle}</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-foreground/80">
            {text.footer.tags.map((tag) => (
              <li key={tag.href}>
                <a
                  className="hover:text-foreground hover:underline"
                  href={tag.href}
                >
                  {tag.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex min-h-44 flex-col justify-between rounded-xl border border-border/55 bg-background/55 p-4">
          <div>
            <p className="mb-3 text-sm font-semibold">
              {text.footer.supportTitle}
            </p>
            <a
              className="inline-flex h-8 items-center rounded-md border border-border/60 bg-background px-2.5 text-[11px] font-semibold hover:bg-secondary"
              href="https://buymeacoffee.com/fran11799"
              rel="noreferrer"
              target="_blank"
            >
              {text.supportCta}
            </a>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <a
              className="inline-flex h-7 items-center rounded-md border border-border/60 bg-background px-2 text-[11px] hover:bg-secondary"
              href="/privacy"
            >
              {text.footer.privacyLink}
            </a>
            <a
              className="inline-flex h-7 items-center rounded-md border border-border/60 bg-background px-2 text-[11px] hover:bg-secondary"
              href="/terms"
            >
              {text.footer.termsLink}
            </a>
            <a
              className="inline-flex h-7 items-center rounded-md border border-border/60 bg-background px-2 text-[11px] hover:bg-secondary"
              href={text.footer.reportUrl}
            >
              {text.footer.reportLink}
            </a>
          </div>
        </section>
      </div>

      <section
        className="mx-auto mt-4 w-full max-w-7xl rounded-xl border border-border/50 bg-background/45 px-4 py-3 text-xs text-foreground/80"
        id="newsletter-banner"
      >
        <p className="font-semibold">{text.footer.newsletterTitle}</p>
        <p className="mt-1">{text.footer.newsletterHint}</p>
      </section>
    </footer>
  );
}
