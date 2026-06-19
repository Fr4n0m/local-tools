"use client";

import { useState, type FormEvent } from "react";
import {
  IconArrowNarrowRight,
  IconBrandGithub,
  IconCirclePlus,
  IconShieldCheck,
  IconStack2,
} from "@tabler/icons-react";
import styles from "./discover-section.module.css";
import Image from "next/image";
import type { Language } from "@/shared/presentation/i18n";
import { sileo } from "sileo";
import { z } from "zod";
import { notifyError } from "@/shared/lib/notify";

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
  subscribeTerms: string;
  subscribeLoadingTitle: string;
  subscribeLoadingDescription: string;
  subscribeSuccessTitle: string;
  subscribeSuccessDescription: string;
  subscribeAlreadyPendingTitle: string;
  subscribeAlreadyPendingDescription: string;
  subscribeAlreadyActiveTitle: string;
  subscribeAlreadyActiveDescription: string;
  subscribeInvalidEmail: string;
  subscribeTermsRequired: string;
  subscribeErrorTitle: string;
  subscribeErrorDescription: string;
};

type DiscoverSectionProps = {
  text: DiscoverCopy;
  language: Language;
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

function CommunityTitle({ title }: { title?: string }) {
  const [top, bottom] = (title ?? "").split(/,\s+/, 2);

  if (!bottom) return <h3>{title}</h3>;

  return (
    <h3 className={styles.communityTitle}>
      <span className={styles.communityTitleTop}>{top},</span>
      <span className={styles.communityTitleBottom}>{bottom}</span>
    </h3>
  );
}

const subscribeSchema = z.object({
  email: z.string().trim().email().max(240),
  acceptTerms: z.literal(true),
});

export function DiscoverSection({ text, language }: DiscoverSectionProps) {
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isAlreadyActive, setIsAlreadyActive] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const roadmapFallback = text.bottomCards[1]?.bodySecondary;
  const roadmapBullets =
    text.bottomCards[1]?.bullets ?? (roadmapFallback ? [roadmapFallback] : []);

  async function onSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInlineMessage(null);

    const parsed = subscribeSchema.safeParse({ email, acceptTerms });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      notifyError(
        firstIssue?.path.includes("acceptTerms")
          ? text.subscribeTermsRequired
          : text.subscribeInvalidEmail,
      );
      return;
    }

    try {
      await sileo.promise(
        fetch("https://codebyfran.es/api/projects/local-tools/subscribe", {
          method: "POST",
          credentials: "omit",
          mode: "cors",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: parsed.data.email,
            locale: language,
            source: "home-final-card",
            acceptTerms: parsed.data.acceptTerms,
          }),
        }).then(async (res) => {
          if (!res.ok) throw new Error(text.subscribeErrorDescription);
          return res.json() as Promise<{
            alreadyActive?: boolean;
            alreadyPending?: boolean;
          }>;
        }),
        {
          loading: {
            title: text.subscribeLoadingTitle,
            description: text.subscribeLoadingDescription,
          },
          success: (data) => {
            if (data.alreadyActive) {
              setIsAlreadyActive(true);
              setInlineMessage(text.subscribeAlreadyActiveDescription);
              return {
                title: text.subscribeAlreadyActiveTitle,
                description: text.subscribeAlreadyActiveDescription,
              };
            }
            if (data.alreadyPending) {
              setInlineMessage(text.subscribeAlreadyPendingDescription);
              return {
                title: text.subscribeAlreadyPendingTitle,
                description: text.subscribeAlreadyPendingDescription,
              };
            }
            setEmail("");
            setAcceptTerms(false);
            setInlineMessage(text.subscribeSuccessDescription);
            return {
              title: text.subscribeSuccessTitle,
              description: text.subscribeSuccessDescription,
            };
          },
          error: () => ({
            title: text.subscribeErrorTitle,
            description: text.subscribeErrorDescription,
          }),
        },
      );
    } catch {
      setInlineMessage(text.subscribeErrorDescription);
    }
  }

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
          <div className={styles.trustDetailAssetWrap} aria-hidden>
            <Image
              src="/overview/discover-privacy-asset.webp"
              alt="Privacy asset"
              fill
              className={styles.trustDetailAsset}
              sizes="(max-width: 1024px) 70vw, 18vw"
            />
          </div>
          <div className={styles.trustBodyPrimaryBlock}>
            <p className={styles.bodyPrimary}>{text.trustBodyPrimary}</p>
          </div>
          {text.trustBodySecondary ? (
            <div className={styles.trustBodySecondaryBlock}>
              <p className={styles.bodySecondary}>{text.trustBodySecondary}</p>
            </div>
          ) : null}
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
        <article
          className={`${styles.bottomCard} ${styles.roadmapCard}`}
          data-reveal="bottom-card"
        >
          <Eyebrow label={text.bottomCards[0]?.eyebrow} />
          <CommunityTitle title={text.bottomCards[0]?.title} />
          <p className={`${styles.subtitle} ${styles.communitySubtitle}`}>
            {text.bottomCards[0]?.subtitle}
          </p>
          <div className={styles.communityBodyWrap}>
            <div className={styles.communityCopyBlockPrimary}>
              <p
                className={`${styles.bodyPrimary} ${styles.communityBodyPrimary} ${
                  language === "en" ? styles.communityBodyPrimaryEn : ""
                }`}
              >
                {text.bottomCards[0]?.bodyPrimary}
              </p>
            </div>
            <div className={styles.communityCopyBlockSecondary}>
              {text.bottomCards[0]?.bodySecondary ? (
                <p
                  className={`${styles.bodySecondary} ${styles.communityBodySecondary}`}
                >
                  {text.bottomCards[0]?.bodySecondary}
                </p>
              ) : null}
            </div>
            <div className={styles.communityAssetWrap} aria-hidden>
              <Image
                src="/overview/discover-community.webp"
                alt="Community contribution asset"
                fill
                className={styles.communityAsset}
                sizes="(max-width: 1024px) 100vw, 30vw"
              />
            </div>
          </div>
          <a
            href="https://github.com/Fr4n0m/local-tools"
            className={`${styles.cardCta} ${styles.communityCta}`}
            rel="noreferrer"
            target="_blank"
          >
            <IconBrandGithub size={13} />
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
                  <IconCirclePlus
                    className={styles.miniIndicator}
                    aria-hidden
                  />
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
            className={styles.cardCta}
            rel="noreferrer"
            target="_blank"
          >
            <IconStack2 size={13} />
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
              <form className={styles.subscribeForm} onSubmit={onSubscribe}>
                <label className="sr-only" htmlFor="discover-email">
                  {text.subscribePlaceholder}
                </label>
                <input
                  id="discover-email"
                  placeholder={text.subscribePlaceholder}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isAlreadyActive}
                />
                <button
                  type="submit"
                  aria-label={text.subscribeButton}
                  disabled={isAlreadyActive}
                >
                  <IconArrowNarrowRight size={16} />
                </button>
                <label className={styles.subscribeTerms}>
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={isAlreadyActive}
                  />
                  <span>{text.subscribeTerms}</span>
                </label>
              </form>
              {inlineMessage ? (
                <p className={styles.subscribeFeedback}>{inlineMessage}</p>
              ) : null}
            </div>
            <div className={styles.mailAssetWrap} aria-hidden>
              <Image
                src="/overview/discover-mail-light.webp"
                alt=""
                fill
                className={`${styles.mailAsset} ${styles.mailAssetLight}`}
                sizes="(max-width: 1024px) 100vw, 24vw"
              />
              <Image
                src="/overview/discover-mail.webp"
                alt=""
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
