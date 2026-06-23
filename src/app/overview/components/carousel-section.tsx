"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  IconCode,
  IconEyeOff,
  IconLock,
  IconShieldCheck,
} from "@tabler/icons-react";
import styles from "./carousel-section.module.css";
import Link from "next/link";
import Image from "next/image";
import { useCallback } from "react";

type CarouselCopy = {
  discoverEyebrowPrimary: string;
  discoverEyebrowSecondary: string;
  discoverTitle: string;
  discoverSubtitle: string;
  discoverMetaLine: string;
  carouselOpenLabel: string;
  carouselCuePrimary: string;
  carouselCueSecondary: string;
  discoverTools: Array<{
    id: string;
    name: string;
    description: string;
    badge: string;
  }>;
  carouselHighlights: Array<{ title: string; description: string }>;
};

type CarouselSectionProps = {
  text: CarouselCopy;
  onScrollNext?: () => void;
};

const HIGHLIGHT_ICONS = [
  IconShieldCheck,
  IconEyeOff,
  IconLock,
  IconCode,
] as const;

const TOOL_IMAGES: Record<string, string> = {
  "json-formatter": "/overview/carousel-final-jsonformatter.webp",
  "url-encoder": "/overview/carousel-final-urlencoder.webp",
  "text-transformer": "/overview/carousel-final-texttransformer.webp",
  "uuid-generator": "/overview/carousel-final-uuidgenerator.webp",
  "base64-tool": "/overview/carousel-final-base64encoder.webp",
  "contrast-checker": "/overview/carousel-final-contrastchecker.webp",
  "qr-generator": "/overview/carousel-final-qrgen.webp",
  "custom-timer": "/overview/carousel-final-customtimer.webp",
};

export function CarouselSection({ onScrollNext, text }: CarouselSectionProps) {
  const loopTools = text.discoverTools;
  const nudgeCarousel = useCallback((dir: "prev" | "next") => {
    const delta =
      Math.round(window.innerHeight * 0.28) * (dir === "next" ? 1 : -1);
    window.scrollBy({ top: delta, behavior: "smooth" });
  }, []);

  return (
    <section
      className={styles.carouselSection}
      data-fade
      data-carousel-section
      data-carousel-edge="start"
    >
      <header className={styles.carouselHeader} data-reveal="carousel-head">
        <div className={styles.headingBlock}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowPrimary}>
              {text.discoverEyebrowPrimary}
            </span>
            <span className={styles.eyebrowSecondary}>
              {" "}
              {text.discoverEyebrowSecondary}
            </span>
          </p>
          <h2>
            <span>{text.discoverTitle}</span>
          </h2>
          <p className={styles.subtitle}>{text.discoverSubtitle}</p>
          <p className={styles.metaLine}>{text.discoverMetaLine}</p>
        </div>
        <div className={styles.headerNav}>
          <button
            aria-label="Previous"
            onClick={() => nudgeCarousel("prev")}
            type="button"
          >
            <IconChevronLeft size={24} stroke={2.4} />
          </button>
          <button
            aria-label="Next"
            onClick={() => nudgeCarousel("next")}
            type="button"
          >
            <IconChevronRight size={24} stroke={2.4} />
          </button>
        </div>
      </header>

      <div className={styles.carouselBody}>
        <div className={styles.toolsRailViewport} data-carousel-viewport>
          <div className={styles.toolsRailWrap} data-carousel-track>
            {loopTools.map((tool, idx) => {
              const imageSrc = TOOL_IMAGES[tool.id];
              return (
                <Link
                  className={styles.toolChip}
                  data-reveal="tool-card"
                  href={`/tools?tool=${tool.id}`}
                  key={`${tool.id}-${idx}`}
                >
                  <span className={styles.toolIconWrap}>
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={`${tool.name} icon`}
                        fill
                        className={styles.toolAsset}
                        sizes="(max-width: 1024px) 62vw, 320px"
                        quality={100}
                        loading={idx === 0 ? "eager" : "lazy"}
                        unoptimized
                      />
                    ) : (
                      <IconShieldCheck
                        className={styles.toolSvg}
                        stroke={1.7}
                      />
                    )}
                  </span>
                  <div>
                    <strong>{tool.name}</strong>
                    <span>{tool.description}</span>
                    <em>{tool.badge}</em>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className={styles.progressTrack} aria-hidden>
          <div className={styles.progressFill} data-carousel-progress />
        </div>
      </div>

      <div className={styles.highlights}>
        {text.carouselHighlights.slice(0, 4).map((item, idx) => {
          const Icon = HIGHLIGHT_ICONS[idx] ?? IconShieldCheck;
          return (
            <article
              key={item.title}
              className={styles.highlightCard}
              data-reveal="highlight-card"
            >
              <span className={styles.highlightIcon}>
                <Icon size={19} stroke={1.8} />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <button
        className={styles.carouselCue}
        onClick={onScrollNext}
        type="button"
      >
        <span className={styles.carouselCuePrimary}>
          {text.carouselCuePrimary}
        </span>{" "}
        <span className={styles.carouselCueSecondary}>
          {text.carouselCueSecondary}
        </span>
      </button>
    </section>
  );
}
