"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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

export function HomeFooter() {
  const [language, setLanguage] = useState<Language>("en");
  const [footerTools, setFooterTools] = useState<Tool[]>(INITIAL_FOOTER_TOOLS);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLanguage(resolveInitialLanguage());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "localtools.language") {
        return;
      }
      setLanguage(resolveInitialLanguage());
    };
    const onLanguageChange = () => {
      setLanguage(resolveInitialLanguage());
    };

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
    const avatar = document.getElementById("home-footer-gravatar-avatar");
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

  const text = sharedMessages[language];

  return (
    <footer className="site-footer site-footer--framed">
      <div className="page-frame">
        <div className="site-footer__inner">
          <div className="site-footer__grid">
            <section className="site-footer__column">
              <Link aria-label="Go to home" className="inline-flex" href="/">
                <AppLogo style={{ color: "#fff" }} />
              </Link>
              <p
                className="site-footer__brandline"
                style={{ marginTop: "6px" }}
              >
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
                        href={`/tools?tool=${tool.id}`}
                        title={tool.name[language]}
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
                  className="site-footer__btn site-footer__btn--bmc"
                  href="https://buymeacoffee.com/fran11799"
                  rel="noreferrer"
                  target="_blank"
                >
                  <IconCoffee aria-hidden size={14} />
                  {text.supportCta}
                </a>
                <a
                  className="site-footer__github-btn"
                  href={text.footer.suggestUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <IconBrandGithub aria-hidden size={14} />
                  {text.footer.suggestCta}
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
                  id="home-footer-gravatar-avatar"
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
      </div>
    </footer>
  );
}
