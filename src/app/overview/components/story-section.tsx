"use client";

import {
  IconArrowsShuffle,
  IconBrackets,
  IconFileAnalytics,
  IconFileUpload,
  IconRocket,
} from "@tabler/icons-react";
import { useId } from "react";
import styles from "./story-section.module.css";

type StoryCopy = {
  storyKickerPrimary: string;
  storyKickerSecondary: string;
  storyHeadingLine1: string;
  storyHeadingLine2: string;
  storyLead: string;
  storyMetaLine: string;
  storyTimelineAria: string;
  storyItems: Array<{
    titlePrimary: string;
    titleSecondary: string;
    bodyPrimary: string;
    bodySecondary: string;
  }>;
  storyCuePrimary: string;
  storyCueSecondary: string;
};

type StorySectionProps = {
  text: StoryCopy;
  onScrollNext?: () => void;
};

const journeyItemIcons = [
  IconFileUpload,
  IconBrackets,
  IconArrowsShuffle,
  IconFileAnalytics,
  IconRocket,
] as const;

export function StorySection({ onScrollNext, text }: StorySectionProps) {
  const gradientId = useId();

  return (
    <section className={`${styles.story} story`} data-fade>
      <div className={styles.storyHead}>
        <p className={`${styles.kicker} storyHeadItem`}>
          <span className={styles.kickerPrimary}>
            {text.storyKickerPrimary}
          </span>{" "}
          <span className={styles.kickerSecondary}>
            {text.storyKickerSecondary}
          </span>
        </p>
        <h2 className="storyHeadItem">
          <span>{text.storyHeadingLine1}</span>
          <span>{text.storyHeadingLine2}</span>
        </h2>
        <p className={`${styles.lead} storyHeadItem`}>{text.storyLead}</p>
        <p className={`${styles.storyMetaLine} storyHeadItem`}>
          {text.storyMetaLine}
        </p>
      </div>

      <div
        className={`${styles.timeline} storyTimeline`}
        aria-label={text.storyTimelineAria}
      >
        <svg
          aria-hidden="true"
          className={styles.timelineCurve}
          preserveAspectRatio="none"
          viewBox="0 0 1000 220"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" x2="100%" y1="100%" y2="0%">
              <stop offset="0%" stopColor="var(--story-line-stop-1)" />
              <stop offset="14%" stopColor="var(--story-line-stop-2)" />
              <stop offset="30%" stopColor="var(--story-line-stop-3)" />
              <stop offset="48%" stopColor="var(--story-line-stop-4)" />
              <stop offset="66%" stopColor="var(--story-line-stop-5)" />
              <stop offset="84%" stopColor="var(--story-line-stop-6)" />
              <stop offset="100%" stopColor="var(--story-line-stop-7)" />
            </linearGradient>
          </defs>
          <path
            className="storyLinePath"
            d="M0 205 C 110 154, 220 220, 335 146 C 450 80, 560 158, 670 92 C 770 36, 848 62, 910 34 C 944 18, 970 10, 992 8"
            stroke={`url(#${gradientId})`}
          />
        </svg>
        {text.storyItems.map((item, idx) => {
          const Icon = journeyItemIcons[idx];
          const step = String(idx + 1).padStart(2, "0");
          return (
            <article
              className={`${styles.node} ${styles[`node${step}` as keyof typeof styles]} storyNode`}
              key={step}
            >
              <div className={`${styles.bubble} storyNodeBubble`}>
                <Icon size={26} stroke={2} />
              </div>
              <h3>
                <span>{item.titlePrimary}</span>
                <span className={styles.nodeTitleSecondary}>
                  {" "}
                  / {item.titleSecondary}
                </span>
              </h3>
              <p className={styles.nodePrimary}>{item.bodyPrimary}</p>
              <p className={styles.nodeSecondary}>{item.bodySecondary}</p>
            </article>
          );
        })}
      </div>
      <button className={styles.storyCue} onClick={onScrollNext} type="button">
        <span className={styles.storyCuePrimary}>{text.storyCuePrimary}</span>{" "}
        <span className={styles.storyCueSecondary}>
          {text.storyCueSecondary}
        </span>
      </button>
    </section>
  );
}
