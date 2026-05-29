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
    description: string;
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

export function MultiBannerSection({
  language,
  text,
}: MultiBannerSectionProps) {
  const rowAssets = [
    "/overview/banner1.webp",
    "/overview/banner2variant.webp",
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
    const list = categoryTools
      .slice(0, 8)
      .map((tool) => tool.name[language])
      .join(", ");
    const href = categoryTools[0]?.id
      ? `/tools?tool=${categoryTools[0].id}`
      : "/tools";
    return { ...copy, list, href, key, Icon: rowIcons[index] };
  });

  return (
    <section className={styles.multiBanner} data-fade>
      <div className={styles.multiBannerRows}>
        {rowContent.map((row, idx) => (
          <article
            className={`${styles.row} ${idx % 2 === 1 ? styles.rowReverse : ""}`}
            data-banner-row
            data-banner-dir={idx % 2 === 0 ? "right" : "left"}
            key={row.key}
          >
            {idx % 2 === 0 ? (
              <>
                <div
                  className={`${styles.visual} ${styles.visualLeft} ${styles.visualAsset}`}
                >
                  <div className={`${styles.assetFrame} ${styles.assetOnly}`}>
                    <Image
                      src={rowAssets[idx]}
                      alt={`${row.titlePrimary} banner`}
                      fill
                      className={
                        idx === 1
                          ? styles.assetCover
                          : idx === 3
                            ? styles.assetContainLarge
                            : styles.assetContain
                      }
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                <div className={styles.copy}>
                  <div className={styles.copyLeft}>
                    <h3>
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
                    <p>{row.description}</p>
                  </div>
                  <div className={styles.copyRight}>
                    <p className={styles.toolsList}>{row.list}</p>
                    <Link href={row.href}>
                      {row.cta} <IconArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.copy}>
                  <div className={styles.copyLeft}>
                    <h3>
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
                    <p>{row.description}</p>
                  </div>
                  <div className={styles.copyRight}>
                    <p className={styles.toolsList}>{row.list}</p>
                    <Link href={row.href}>
                      {row.cta} <IconArrowRight size={14} />
                    </Link>
                  </div>
                </div>
                <div
                  className={`${styles.visual} ${styles.visualRight} ${styles.visualAsset}`}
                >
                  <div className={`${styles.assetFrame} ${styles.assetOnly}`}>
                    <Image
                      src={rowAssets[idx]}
                      alt={`${row.titlePrimary} banner`}
                      fill
                      className={
                        idx === 1
                          ? styles.assetCover
                          : idx === 3
                            ? styles.assetContainLarge
                            : styles.assetContain
                      }
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
