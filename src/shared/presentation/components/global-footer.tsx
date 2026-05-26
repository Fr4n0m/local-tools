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
    <footer className="site-footer">
      <div className="site-footer__grid">
        <section className="site-footer__card">
          <div className="space-y-3">
            <p className="site-footer__title">{text.footer.suggestTitle}</p>
            <p className="site-footer__muted">{text.footer.logoPlaceholder}</p>
          </div>
          <div>
            <a className="site-footer__btn" href="#newsletter-banner">
              <IconHeart size={15} />
              {text.footer.suggestCta}
            </a>
            <p className="site-footer__muted">{text.footer.brandLine}</p>
          </div>
        </section>

        <section className="site-footer__card">
          <p className="site-footer__title">{text.footer.tagsTitle}</p>
          <ul className="site-footer__tags">
            {text.footer.tags.map((tag) => (
              <li key={tag.href}>
                <a className="site-footer__tag-link" href={tag.href}>
                  {tag.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="site-footer__card">
          <div>
            <p className="site-footer__title">{text.footer.supportTitle}</p>
            <a
              className="site-footer__btn"
              href="https://buymeacoffee.com/fran11799"
              rel="noreferrer"
              target="_blank"
            >
              {text.supportCta}
            </a>
          </div>
          <div className="site-footer__legal">
            <a className="site-footer__btn" href="/privacy">
              {text.footer.privacyLink}
            </a>
            <a className="site-footer__btn" href="/terms">
              {text.footer.termsLink}
            </a>
            <a
              className="site-footer__btn"
              href={text.footer.reportUrl}
              rel="noreferrer"
              target="_blank"
            >
              {text.footer.reportLink}
            </a>
          </div>
        </section>
      </div>

      <section className="site-footer__newsletter" id="newsletter-banner">
        <p className="site-footer__title">{text.footer.newsletterTitle}</p>
        <p className="mt-1">{text.footer.newsletterHint}</p>
      </section>
    </footer>
  );
}
