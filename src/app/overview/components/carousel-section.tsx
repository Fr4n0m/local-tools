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
};

export function CarouselSection({ text }: CarouselSectionProps) {
  const loopTools = text.discoverTools;
  const highlightIcons = [
    IconShieldCheck,
    IconEyeOff,
    IconLock,
    IconCode,
  ] as const;
  const toolImages: Record<string, string> = {
    "json-formatter": "/overview/carousel-jsonformatter.webp",
    "url-encoder": "/overview/carousel-urlencoder.webp",
    "text-transformer": "/overview/carousel-texttransformer.webp",
    "uuid-generator": "/overview/carousel-uuidgenerator.webp",
    "base64-tool": "/overview/carousel-base64encoder.webp",
    "contrast-checker": "/overview/carousel-contrastchecker.webp",
    "qr-generator": "/overview/carousel-qrgen.webp",
    "custom-timer": "/overview/carousel-customtimer.webp",
  };
  const nudgeCarousel = useCallback((dir: "prev" | "next") => {
    const delta =
      Math.round(window.innerHeight * 0.28) * (dir === "next" ? 1 : -1);
    window.scrollBy({ top: delta, behavior: "smooth" });
  }, []);

  return (
    <section
      className={styles.carouselSection}
      data-carousel-section
      data-carousel-edge="start"
    >
      <header className={styles.carouselHeader}>
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
            <IconChevronLeft size={24} stroke={1.9} />
          </button>
          <button
            aria-label="Next"
            onClick={() => nudgeCarousel("next")}
            type="button"
          >
            <IconChevronRight size={24} stroke={1.9} />
          </button>
        </div>
      </header>

      <div className={styles.carouselBody}>
        <div className={styles.toolsRailViewport} data-carousel-viewport>
          <div className={styles.toolsRailWrap} data-carousel-track>
            {loopTools.map((tool, idx) => {
              const imageSrc = toolImages[tool.id];
              return (
                <Link
                  className={styles.toolChip}
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
                        sizes="80px"
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
          const Icon = highlightIcons[idx] ?? IconShieldCheck;
          return (
            <article key={item.title} className={styles.highlightCard}>
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
    </section>
  );
}
