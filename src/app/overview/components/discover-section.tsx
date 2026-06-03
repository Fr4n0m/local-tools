"use client";

import {
  IconArrowNarrowRight,
  IconBrandGithub,
  IconShieldCheck,
  IconStack2,
} from "@tabler/icons-react";
import styles from "./discover-section.module.css";
import Image from "next/image";

type DiscoverCopy = {
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
  subscribeButton: string;
  subscribePlaceholder: string;
};

type DiscoverSectionProps = {
  text: DiscoverCopy;
};

function Eyebrow({ label }: { label?: string }) {
  const [primary, secondary] = (label ?? "").split(" / ", 2);

  return (
    <p className={styles.eyebrow}>
      <span className={styles.eyebrowPrimary}>{primary}</span>
      {secondary ? (
        <span className={styles.eyebrowSecondary}> {secondary}</span>
      ) : null}
    </p>
  );
}

export function DiscoverSection({ text }: DiscoverSectionProps) {
  const roadmapFallback = text.bottomCards[1]?.bodySecondary;
  const roadmapBullets =
    text.bottomCards[1]?.bullets ?? (roadmapFallback ? [roadmapFallback] : []);

  return (
    <section
      className={styles.finalSection}
      data-fade
      data-final-section
      id="subscribe-updates"
    >
      <article className={styles.trustBlock} data-reveal="trust-block">
        <div className={styles.trustVisual} aria-hidden>
          <div className={styles.trustAssetWrap}>
            <Image
              src="/overview/discover-privacy-lock.webp"
              alt="Local privacy lock"
              fill
              className={styles.trustAsset}
              sizes="(max-width: 1024px) 100vw, 18vw"
            />
          </div>
        </div>
        <div className={styles.trustCopy}>
          <Eyebrow label={text.trustEyebrow} />
          <h3>{text.trustTitle}</h3>
          <p className={styles.subtitle}>{text.trustSubtitle}</p>
        </div>
        <div className={styles.trustBody}>
          <p className={styles.bodyPrimary}>{text.trustBodyPrimary}</p>
          <p className={styles.bodySecondary}>{text.trustBodySecondary}</p>
        </div>
        <ul className={styles.trustChecks}>
          {text.trustChecks.map((item) => (
            <li key={item}>
              <IconShieldCheck size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>

      <div className={styles.finalCards}>
        <article className={styles.bottomCard} data-reveal="bottom-card">
          <Eyebrow label={text.bottomCards[0]?.eyebrow} />
          <h3>{text.bottomCards[0]?.title}</h3>
          <p className={styles.subtitle}>{text.bottomCards[0]?.subtitle}</p>
          <div className={styles.cardRow}>
            <div>
              <p className={styles.bodyPrimary}>
                {text.bottomCards[0]?.bodyPrimary}
              </p>
              <p className={styles.bodySecondary}>
                {text.bottomCards[0]?.bodySecondary}
              </p>
            </div>
            <div className={styles.communityAssetWrap} aria-hidden>
              <Image
                src="/overview/discover-community.webp"
                alt="Community contribution asset"
                fill
                className={styles.communityAsset}
                sizes="(max-width: 1024px) 100vw, 24vw"
              />
            </div>
          </div>
          <a
            href="https://github.com/Fr4n0m/local-tools"
            rel="noreferrer"
            target="_blank"
          >
            <IconBrandGithub size={14} />
            {text.bottomCards[0]?.cta}
          </a>
        </article>

        <article className={styles.bottomCard} data-reveal="bottom-card">
          <Eyebrow label={text.bottomCards[1]?.eyebrow} />
          <h3>{text.bottomCards[1]?.title}</h3>
          <p className={styles.subtitle}>{text.bottomCards[1]?.subtitle}</p>
          <p className={styles.bodyPrimary}>
            {text.bottomCards[1]?.bodyPrimary}
          </p>
          <div className={styles.roadmapRow}>
            <ul className={styles.miniList}>
              {roadmapBullets.map((bullet) => (
                <li key={bullet}>
                  <span className={styles.miniIndicator} aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <div className={styles.roadmapAssetWrap} aria-hidden>
              <Image
                src="/overview/discover-roadmap.webp"
                alt="Roadmap stack asset"
                fill
                className={styles.roadmapAsset}
                sizes="(max-width: 1024px) 100vw, 24vw"
              />
            </div>
          </div>
          <a
            href="https://github.com/Fr4n0m/local-tools/issues/new/choose"
            rel="noreferrer"
            target="_blank"
          >
            <IconStack2 size={14} />
            {text.bottomCards[1]?.cta}
          </a>
        </article>

        <article className={styles.bottomCard} data-reveal="bottom-card">
          <Eyebrow label={text.bottomCards[2]?.eyebrow} />
          <h3>{text.bottomCards[2]?.title}</h3>
          <p className={styles.subtitle}>{text.bottomCards[2]?.subtitle}</p>
          <div className={styles.cardRow}>
            <div>
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
            </div>
            <div className={styles.mailAssetWrap} aria-hidden>
              <Image
                src="/overview/discover-mail-light.webp"
                alt="Mail paper plane asset light"
                fill
                className={`${styles.mailAsset} ${styles.mailAssetLight}`}
                sizes="(max-width: 1024px) 100vw, 24vw"
              />
              <Image
                src="/overview/discover-mail.webp"
                alt="Mail paper plane asset dark"
                fill
                className={`${styles.mailAsset} ${styles.mailAssetDark}`}
                sizes="(max-width: 1024px) 100vw, 24vw"
              />
            </div>
          </div>
          <p className={styles.bodySecondary}>
            {text.bottomCards[2]?.bodySecondary}
          </p>
        </article>
      </div>
    </section>
  );
}
