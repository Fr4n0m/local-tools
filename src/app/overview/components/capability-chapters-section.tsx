"use client";

import type React from "react";
import styles from "./capability-chapters-section.module.css";

type ChapterItem = {
  category: string;
  label: string;
  summary: string;
  names: string[];
  rest: number;
  icon: React.ComponentType<{ size?: number }>;
};

type CapabilityCopy = {
  chapterTitle: string;
  chapterIntro: string;
  why: string;
  what: string;
  fit: string;
};

type CapabilityChaptersSectionProps = {
  chapters: ChapterItem[];
  text: CapabilityCopy;
};

export function CapabilityChaptersSection({
  chapters,
  text,
}: CapabilityChaptersSectionProps) {
  return (
    <>
      <section className={styles.chapterIntro} data-fade>
        <h2>{text.chapterTitle}</h2>
        <p>{text.chapterIntro}</p>
      </section>

      {chapters.map((chapter, idx) => {
        const Icon = chapter.icon;
        const flipped = idx % 2 === 1;
        return (
          <section
            className={`${styles.chapter} ${flipped ? styles.chapterFlipped : ""}`}
            data-slide
            key={chapter.category}
          >
            <aside className={`${styles.chapterLead} chapterLead`}>
              <h3>
                <Icon size={18} /> {chapter.label}
              </h3>
              <p>
                {text.why}: {chapter.summary}
              </p>
              <p>
                {text.what}: {chapter.names.join(" · ")}
                {chapter.rest > 0 ? ` +${chapter.rest}` : ""}
              </p>
              <a
                href={`/tools?tool=${chapter.category === "files-media" ? "image-converter" : chapter.category === "data-encoding" ? "json-formatter" : chapter.category === "text-code" ? "text-transformer" : "mesh-gradient"}`}
              >
                {text.fit}
              </a>
            </aside>
            <div
              className={`${styles.chapterMedia} chapterMedia`}
              aria-hidden="true"
            />
          </section>
        );
      })}
    </>
  );
}
