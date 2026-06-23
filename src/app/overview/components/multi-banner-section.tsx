"use client";

import {
  IconArrowRight,
  IconBraces,
  IconDatabase,
  IconTool,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { tools } from "@/modules/tool-registry/application/tools";
import type { Language } from "@/shared/presentation/i18n";
import styles from "./multi-banner-section.module.css";

type MultiBannerCopy = {
  section3Rows: Array<{
    key: string;
    titlePrimary: string;
    titleSecondary: string;
    descriptionPrimary: string;
    descriptionSecondary?: string;
    cta: string;
  }>;
};

type MultiBannerSectionProps = {
  language: Language;
  text: MultiBannerCopy;
};

const categoryOrder = ["data-encoding", "web", "dev", "advanced"] as const;

const categoryFallback = {
  "data-encoding": "data-encoding",
  web: "data-encoding",
  dev: "text-code",
  advanced: "advanced",
} as const;

const preferredToolByRow: Record<(typeof categoryOrder)[number], string> = {
  "data-encoding": "json-formatter",
  web: "url-encoder",
  dev: "text-transformer",
  advanced: "custom-timer",
};

export function MultiBannerSection({
  language,
  text,
}: MultiBannerSectionProps) {
  const rowAssets = [
    "/overview/banner1.webp",
    "/overview/banner2variant (2).webp",
    "/overview/banner3.webp",
    "/overview/banner4.webp",
  ] as const;

  const rowIcons = [IconDatabase, IconWorld, IconBraces, IconTool] as const;

  const rowContent = categoryOrder.map((key, index) => {
    const copy = text.section3Rows[index];
    const mappedCategory = categoryFallback[key];
    const categoryTools = tools.filter(
      (tool) => tool.category === mappedCategory,
    );
    const selectedNames = categoryTools
      .slice(0, 4)
      .map((tool) => tool.name[language]);
    const list = `${selectedNames.join(", ")}${categoryTools.length > 4 ? ", ..." : ""}`;
    const preferred = preferredToolByRow[key];
    const preferredExists = categoryTools.some((tool) => tool.id === preferred);
    const targetToolId = preferredExists ? preferred : categoryTools[0]?.id;
    const href = targetToolId ? `/tools?tool=${targetToolId}` : "/tools";
    return { ...copy, list, href, key, Icon: rowIcons[index] };
  });

  return (
    <section className={styles.multiBanner} data-fade>
      <div className={styles.multiBannerRows}>
        {rowContent.map((row, idx) => (
          <article
            className={`${styles.row} ${idx % 2 === 1 ? styles.rowReverse : ""}`}
            data-banner-row
            data-banner-dir={idx % 2 === 0 ? "left" : "right"}
            key={row.key}
          >
            {idx % 2 === 0 && (
              <div
                className={`${styles.visual} ${styles.visualLeft} ${styles.visualAsset} ${styles.gradientLtr}`}
              >
                <div className={`${styles.assetFrame} ${styles.assetOnly}`}>
                  <Image
                    src={rowAssets[idx]}
                    alt={`${row.titlePrimary} banner`}
                    fill
                    className={styles.assetContain}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            )}
            <div className={styles.copy}>
              <h3 className={styles.copyTitle}>
                <span className={styles.titleWithIcon}>
                  <span className={styles.titleIconBadge}>
                    <row.Icon size={14} stroke={2} />
                  </span>
                  {row.titlePrimary}
                </span>
                {row.titleSecondary ? (
                  <span className={styles.secondary}>
                    {" "}
                    / {row.titleSecondary}
                  </span>
                ) : null}
              </h3>
              <div className={styles.copyLeft}>
                <p className={styles.primaryParagraph}>
                  {row.descriptionPrimary}
                </p>
                {row.descriptionSecondary ? (
                  <p className={styles.mutedParagraph}>
                    {row.descriptionSecondary}
                  </p>
                ) : null}
              </div>
              <div className={styles.copyRight}>
                <p className={styles.toolsList}>{row.list}</p>
                <Link href={row.href}>
                  {row.cta} <IconArrowRight size={14} stroke={2.4} />
                </Link>
              </div>
            </div>
            {idx % 2 === 1 && (
              <div
                className={`${styles.visual} ${styles.visualRight} ${styles.visualAsset} ${styles.gradientRtl}`}
              >
                <div className={`${styles.assetFrame} ${styles.assetOnly}`}>
                  <Image
                    src={rowAssets[idx]}
                    alt={`${row.titlePrimary} banner`}
                    fill
                    className={styles.assetContain}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
