"use client";

import {
  IconArrowDown,
  IconBellRinging,
  IconBolt,
  IconBrandGithub,
  IconLock,
  IconRocket,
  IconSearch,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";

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
  heroTrustItems: Array<{
    title: string;
    description: string;
  }>;
};

type HeroSectionProps = {
  text: HeroCopy;
  onScrollNext: () => void;
};

export function HeroSection({ text, onScrollNext }: HeroSectionProps) {
  const [trustLocal, trustOpen, trustDeveloper, trustPlatform] =
    text.heroTrustItems;

  return (
    <section className={`${styles.hero} hero`} data-fade>
      <div className={`${styles.heroCopy} heroCopy`}>
        <h1>
          <span>{text.heroLeadLine1}</span>
          <span>{text.heroLeadLine2}</span>
        </h1>
        <p className={`${styles.subLead} subLead`}>{text.heroTitle}</p>
        <p className={`${styles.heroText} heroText`}>{text.heroText}</p>
        <div className={`${styles.heroMeta} heroMeta`}>
          <article>
            <IconLock size={14} />
            <div>
              <strong>{trustLocal.title}</strong>
              <span>{trustLocal.description}</span>
            </div>
          </article>
          <article>
            <IconBrandGithub size={14} />
            <div>
              <strong>{trustOpen.title}</strong>
              <span>{trustOpen.description}</span>
            </div>
          </article>
          <article>
            <IconBolt size={14} />
            <div>
              <strong>{trustDeveloper.title}</strong>
              <span>{trustDeveloper.description}</span>
            </div>
          </article>
          <article>
            <IconWorld size={14} />
            <div>
              <strong>{trustPlatform.title}</strong>
              <span>{trustPlatform.description}</span>
            </div>
          </article>
        </div>
        <div className={`${styles.heroActions} heroActions`}>
          <Link className={styles.primaryBtn} href="/tools?view=grid">
            {text.heroCtaSecondary}
            <IconRocket size={14} />
          </Link>
          <Link className={styles.secondaryBtn} href="/#subscribe-updates">
            {text.heroCtaPrimary}
            <IconBellRinging size={14} />
          </Link>
        </div>
      </div>
      <div className={`${styles.heroAsset} heroAsset`}>
        <div
          className={`${styles.heroMockFrame} heroAssetShape`}
          aria-hidden="true"
        >
          <div className={styles.heroMockTopbar}>
            <AppLogo className={styles.heroMockLogo} />
            <div className={styles.heroMockSearch}>
              <IconSearch size={12} />
              <span>Search tools&hellip;</span>
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
