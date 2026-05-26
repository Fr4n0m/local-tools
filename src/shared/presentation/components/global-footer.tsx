"use client";
import { useEffect, useState } from "react";
import "@gravatar-com/hovercards/dist/style.css";
import {
  IconAlertCircle,
  IconBrandGithub,
  IconCoffee,
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
  const [footerTools, setFooterTools] = useState<Tool[]>(INITIAL_FOOTER_TOOLS);

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
    const initTimer = window.setTimeout(() => {
      setFooterTools(pickRandomTools());
    }, 0);

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

    return () => {
      window.clearTimeout(initTimer);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const avatar = document.getElementById("footer-gravatar-avatar");
    if (!avatar) return;
    void import("@gravatar-com/hovercards").then(({ Hovercards }) => {
      const hc = new Hovercards({
        placement: "top",
        offset: 12,
        autoFlip: true,
        autoShift: true,
      });
      hc.attach(avatar);
    });
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
            <p className="site-footer__brandline" style={{ marginTop: "6px" }}>
              {text.footer.brandLine}
            </p>
          </section>

          <section className="site-footer__column">
            <p className="site-footer__title">{text.footer.tagsTitle}</p>
            <ul className="site-footer__tags">
              {footerTools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <li key={tool.id}>
                    <a
                      aria-label={tool.name[language]}
                      className="aside-tool-btn site-footer__tool-link"
                      title={tool.name[language]}
                      href={`/?tool=${tool.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, "", `/?tool=${tool.id}`);
                        window.dispatchEvent(new PopStateEvent("popstate"));
                      }}
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
                href={text.footer.suggestUrl}
                rel="noreferrer"
                target="_blank"
              >
                <IconBrandGithub aria-hidden size={13} />
                {text.footer.suggestCta}
              </a>
              <a
                className="site-footer__btn"
                href="https://buymeacoffee.com/fran11799"
                rel="noreferrer"
                target="_blank"
              >
                <IconCoffee aria-hidden size={13} />
                {text.supportCta}
              </a>
            </div>
          </section>
        </div>

        <div className="site-footer__bottom">
          <div className="site-footer__author">
            <span>Built for developers by</span>
            <a
              aria-label="Fr4n0m on Gravatar"
              className="site-footer__author-avatar"
              href="https://gravatar.com/fr4n0m"
              rel="noreferrer"
              target="_blank"
            >
              <img
                alt="Fr4n0m"
                data-gravatar-hash="45f9e6ff5a1ed8b109f19dc13f59c26e7d39fceb75f9344ac30ea6db18f6fbde"
                height={20}
                id="footer-gravatar-avatar"
                src="https://www.gravatar.com/avatar/45f9e6ff5a1ed8b109f19dc13f59c26e7d39fceb75f9344ac30ea6db18f6fbde?s=40&d=mp"
                width={20}
              />
            </a>
            <a
              className="site-footer__author-name"
              href="https://codebyfran.es"
              rel="noreferrer"
              target="_blank"
            >
              Fr4n0m
            </a>
          </div>
          <div
            className="site-footer__legal"
            style={{ justifyContent: "flex-end" }}
          >
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
