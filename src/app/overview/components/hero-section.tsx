"use client";

import {
  IconArrowDown,
  IconBellRinging,
  IconBolt,
  IconBrandGithub,
  IconLock,
  IconRocket,
  IconWorld,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

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
          <Link
            className={`${styles.heroBtn} ${styles.primaryBtn} lt-button lt-button--solid`}
            href="/tools?view=grid"
          >
            {text.heroCtaSecondary}
            <IconRocket size={14} />
          </Link>
          <Link
            className={`${styles.heroBtn} ${styles.secondaryBtn} lt-button lt-button--outline`}
            href="/#subscribe-updates"
          >
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
          <Image
            alt=""
            className={`${styles.heroMockImage} ${styles.heroMockImageLight}`}
            fill
            sizes="(max-width: 1024px) 100vw, 48vw"
            src="/assets/overview/home-hero-tools-grid-light.webp"
          />
          <Image
            alt=""
            className={`${styles.heroMockImage} ${styles.heroMockImageDark}`}
            fill
            sizes="(max-width: 1024px) 100vw, 48vw"
            src="/assets/overview/home-hero-tools-grid-dark.webp"
          />
        </div>
      </div>
      <button className={styles.scrollCue} onClick={onScrollNext} type="button">
        <IconArrowDown aria-hidden size={14} />
        <span>{text.trust}</span>
      </button>
    </section>
  );
}
