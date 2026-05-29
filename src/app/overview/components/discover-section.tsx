"use client";

import {
  IconArrowNarrowRight,
  IconArrowRight,
  IconBrandGithub,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconLock,
  IconMail,
  IconRocket,
  IconRoute,
  IconShieldCheck,
  IconStack2,
} from "@tabler/icons-react";
import styles from "./discover-section.module.css";
import Link from "next/link";

type DiscoverCopy = {
  discoverEyebrow: string;
  discoverTitle: string;
  discoverSubtitle: string;
  discoverTools: Array<{ name: string; hint: string }>;
  trustEyebrow: string;
  trustTitle: string;
  trustSubtitle: string;
  trustBodyPrimary: string;
  trustBodySecondary: string;
  trustChecks: string[];
  bottomCards: Array<{
    eyebrow: string;
    title: string;
    subtitle: string;
    bodyPrimary: string;
    bodySecondary: string;
    bullets?: string[];
    cta: string;
  }>;
  finalTitle: string;
  finalText: string;
  subscribe: string;
  subscribeText: string;
  subscribeButton: string;
  subscribePlaceholder: string;
};

type DiscoverSectionProps = {
  text: DiscoverCopy;
};

export function DiscoverSection({ text }: DiscoverSectionProps) {
  const topTools = text.discoverTools.slice(0, 8);

  return (
    <section className={styles.finalSection} data-fade id="subscribe-updates">
      <header className={styles.discoverHeader}>
        <div>
          <p className={styles.eyebrow}>{text.discoverEyebrow}</p>
          <h2>{text.discoverTitle}</h2>
          <p className={styles.subtitle}>{text.discoverSubtitle}</p>
        </div>
        <div className={styles.headerNav}>
          <button aria-label="Previous">
            <IconChevronLeft size={16} />
          </button>
          <button aria-label="Next">
            <IconChevronRight size={16} />
          </button>
        </div>
      </header>

      <div className={styles.toolsRail}>
        {topTools.map((tool, idx) => (
          <article className={styles.toolChip} key={`${tool.name}-${idx}`}>
            <IconRoute size={14} />
            <div>
              <strong>{tool.name}</strong>
              <span>{tool.hint}</span>
            </div>
          </article>
        ))}
      </div>

      <article className={styles.trustBlock}>
        <div className={styles.trustVisual} aria-hidden>
          <div className={styles.trustLock}>
            <IconLock size={38} />
          </div>
        </div>
        <div className={styles.trustCopy}>
          <p className={styles.eyebrow}>{text.trustEyebrow}</p>
          <h3>{text.trustTitle}</h3>
          <p className={styles.subtitle}>{text.trustSubtitle}</p>
          <p className={styles.bodyPrimary}>{text.trustBodyPrimary}</p>
          <p className={styles.bodySecondary}>{text.trustBodySecondary}</p>
        </div>
        <ul className={styles.trustChecks}>
          {text.trustChecks.map((item) => (
            <li key={item}>
              <IconCircleCheck size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>

      <div className={styles.finalCards}>
        <article className={styles.bottomCard}>
          <p className={styles.eyebrow}>{text.bottomCards[0]?.eyebrow}</p>
          <h3>{text.bottomCards[0]?.title}</h3>
          <p className={styles.subtitle}>{text.bottomCards[0]?.subtitle}</p>
          <p className={styles.bodyPrimary}>
            {text.bottomCards[0]?.bodyPrimary}
          </p>
          <p className={styles.bodySecondary}>
            {text.bottomCards[0]?.bodySecondary}
          </p>
          <a
            href="https://github.com/Fr4n0m/local-tools"
            rel="noreferrer"
            target="_blank"
          >
            <IconBrandGithub size={14} />
            {text.bottomCards[0]?.cta}
          </a>
        </article>

        <article className={styles.bottomCard}>
          <p className={styles.eyebrow}>{text.bottomCards[1]?.eyebrow}</p>
          <h3>{text.bottomCards[1]?.title}</h3>
          <p className={styles.subtitle}>{text.bottomCards[1]?.subtitle}</p>
          <p className={styles.bodyPrimary}>
            {text.bottomCards[1]?.bodyPrimary}
          </p>
          <ul className={styles.miniList}>
            {(
              text.bottomCards[1]?.bullets ?? [
                text.bottomCards[1]?.bodySecondary,
              ]
            )
              .filter(Boolean)
              .map((bullet) => (
                <li key={bullet}>
                  <IconCircleCheck size={14} />
                  <span>{bullet}</span>
                </li>
              ))}
          </ul>
          <a
            href="https://github.com/Fr4n0m/local-tools/issues"
            rel="noreferrer"
            target="_blank"
          >
            <IconStack2 size={14} />
            {text.bottomCards[1]?.cta}
          </a>
        </article>

        <article className={styles.bottomCard}>
          <p className={styles.eyebrow}>{text.bottomCards[2]?.eyebrow}</p>
          <h3>{text.bottomCards[2]?.title}</h3>
          <p className={styles.subtitle}>{text.bottomCards[2]?.subtitle}</p>
          <p className={styles.bodyPrimary}>
            {text.bottomCards[2]?.bodyPrimary}
          </p>
          <form
            className={styles.subscribeForm}
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="sr-only" htmlFor="discover-email">
              {text.subscribePlaceholder}
            </label>
            <input
              id="discover-email"
              placeholder={text.subscribePlaceholder}
              type="email"
            />
            <button type="submit" aria-label={text.subscribeButton}>
              <IconArrowNarrowRight size={16} />
            </button>
          </form>
          <p className={styles.bodySecondary}>
            {text.bottomCards[2]?.bodySecondary}
          </p>
        </article>
      </div>

      <div className={styles.bottomLinks}>
        <Link href="/tools">
          <IconRocket size={14} />
          {text.finalTitle}
          <IconArrowRight size={14} />
        </Link>
        <Link href="/#subscribe-updates">
          <IconMail size={14} />
          {text.subscribe}
        </Link>
        <a
          href="https://github.com/Fr4n0m/local-tools"
          rel="noreferrer"
          target="_blank"
        >
          <IconShieldCheck size={14} />
          {text.finalText}
        </a>
      </div>
    </section>
  );
}
