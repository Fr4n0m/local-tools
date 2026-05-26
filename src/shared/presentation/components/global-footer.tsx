"use client";
import { useEffect, useState } from "react";
import {
  IconAlertCircle,
  IconFileText,
  IconShieldLock,
} from "@tabler/icons-react";
import { AppLogo } from "@/shared/presentation/components/app-logo";
import { tools } from "@/modules/tool-registry/application/tools";
import type { Tool } from "@/modules/tool-registry/domain/tool";
import {
  resolveInitialLanguage,
  sharedMessages,
  type Language,
} from "@/shared/presentation/i18n";

type Density = "comfortable" | "compact";
const FOOTER_TOOL_COUNT = 6;
const FOOTER_ROTATE_MS = 30000;
const INITIAL_FOOTER_TOOLS = tools.slice(0, FOOTER_TOOL_COUNT);

function pickRandomTools(previousIds: string[] = []): Tool[] {
  const previousSet = new Set(previousIds);
  const pool = tools.filter((tool) => !previousSet.has(tool.id));
  const source = pool.length >= FOOTER_TOOL_COUNT ? pool : tools;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, FOOTER_TOOL_COUNT);
}

function pickReplacementTool(currentIds: string[]): Tool {
  const currentSet = new Set(currentIds);
  const pool = tools.filter((tool) => !currentSet.has(tool.id));
  if (pool.length === 0) {
    return tools[Math.floor(Math.random() * tools.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

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
  const [footerTools, setFooterTools] = useState<Tool[]>(() =>
    pickRandomTools(),
  );

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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFooterTools((previous) => {
        if (previous.length === 0) {
          return pickRandomTools();
        }

        const next = [...previous];
        const replaceIndex = Math.floor(Math.random() * next.length);
        const replacement = pickReplacementTool(
          previous.map((tool) => tool.id),
        );
        next[replaceIndex] = replacement;
        return next;
      });
    }, FOOTER_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, []);

  if (density === "compact") {
    return null;
  }

  const text = sharedMessages[language];

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <section className="site-footer__column">
            <AppLogo style={{ color: "#fff" }} />
            <p className="site-footer__muted" style={{ marginTop: "8px" }}>
              {text.footer.suggestTitle}
            </p>
            <div className="site-footer__actions">
              <a className="site-footer__subscribe-link" href="#">
                {text.footer.suggestCta}
              </a>
            </div>
          </section>

          <section className="site-footer__column">
            <p className="site-footer__title">{text.footer.tagsTitle}</p>
            <ul className="site-footer__tags">
              {footerTools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <li key={tool.id}>
                    <a
                      className="aside-tool-btn site-footer__tool-link"
                      href={`/?tool=${tool.id}`}
                    >
                      <span aria-hidden className="shrink-0">
                        <ToolIcon size={14} />
                      </span>
                      <span>{tool.name[language]}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="site-footer__column site-footer__column--right">
            <p className="site-footer__title">{text.footer.supportTitle}</p>
            <div className="site-footer__actions">
              <a
                className="site-footer__btn"
                href="https://buymeacoffee.com/fran11799"
                rel="noreferrer"
                target="_blank"
              >
                {text.supportCta}
              </a>
            </div>
          </section>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__brandline">{text.footer.brandLine}</p>
          <div className="site-footer__legal">
            <a className="site-footer__legal-link" href="/privacy">
              <IconShieldLock aria-hidden size={14} />
              {text.footer.privacyLink}
            </a>
            <a className="site-footer__legal-link" href="/terms">
              <IconFileText aria-hidden size={14} />
              {text.footer.termsLink}
            </a>
            <a
              className="site-footer__legal-link"
              href={text.footer.reportUrl}
              rel="noreferrer"
              target="_blank"
            >
              <IconAlertCircle aria-hidden size={14} />
              {text.footer.reportLink}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
