"use client";

import {
  IconArrowDown,
  IconArrowRight,
  IconBolt,
  IconBrandGithub,
  IconLock,
  IconRocket,
  IconSearch,
  IconWorld,
} from "@tabler/icons-react";

import { AppLogo } from "@/shared/presentation/components/app-logo";
import styles from "./hero-section.module.css";

type HeroCopy = {
  heroLeadLine1: string;
  heroLeadLine2: string;
  heroTitle: string;
  heroText: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  trust: string;
};

type HeroSectionProps = {
  text: HeroCopy;
  onScrollNext: () => void;
};

export function HeroSection({ text, onScrollNext }: HeroSectionProps) {
  return (
    <section className={`${styles.hero} hero`} data-fade>
      <div className={`${styles.heroCopy} heroCopy`}>
        <h1>
          <span>{text.heroLeadLine1}</span>
          <span>{text.heroLeadLine2}</span>
        </h1>
        <p className={styles.subLead}>{text.heroTitle}</p>
        <p className={styles.heroText}>{text.heroText}</p>
        <div className={styles.heroMeta}>
          <article>
            <IconLock size={14} />
            <div>
              <strong>100% Local</strong>
              <span>Everything runs in your browser.</span>
            </div>
          </article>
          <article>
            <IconBrandGithub size={14} />
            <div>
              <strong>Open Source</strong>
              <span>Transparent by design. Built in the open.</span>
            </div>
          </article>
          <article>
            <IconBolt size={14} />
            <div>
              <strong>Developer First</strong>
              <span>Fast, focused, and built for real workflows.</span>
            </div>
          </article>
          <article>
            <IconWorld size={14} />
            <div>
              <strong>Cross Platform</strong>
              <span>macOS, Windows, and Linux.</span>
            </div>
          </article>
        </div>
        <div className={`${styles.heroActions} heroActions`}>
          <a className={styles.primaryBtn} href="/tools">
            {text.heroCtaPrimary}
            <IconArrowRight size={14} />
          </a>
          <a className={styles.secondaryBtn} href="/tools?tool=json-formatter">
            <IconRocket size={14} />
            {text.heroCtaSecondary}
          </a>
        </div>
      </div>
      <div className={`${styles.heroAsset} heroAsset`}>
        <div className={styles.heroMockFrame} aria-hidden="true">
          <div className={styles.heroMockTopbar}>
            <AppLogo className={styles.heroMockLogo} />
            <div className={styles.heroMockSearch}>
              <IconSearch size={12} />
              <span>Search tools...</span>
            </div>
          </div>
          <div className={styles.heroMockBody}>
            <div className={styles.heroMockSidebar}>
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className={styles.heroMockGrid}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <article key={`mock-${idx}`}>
                  <div />
                  <p />
                  <p />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button className={styles.scrollCue} onClick={onScrollNext} type="button">
        <IconArrowDown aria-hidden size={14} />
        <span>{text.trust}</span>
      </button>
    </section>
  );
}
