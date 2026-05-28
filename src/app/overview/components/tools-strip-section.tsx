"use client";

import type React from "react";
import type { Language } from "@/shared/presentation/i18n";
import { tools } from "@/modules/tool-registry/application/tools";
import styles from "./tools-strip-section.module.css";

type StripCopy = {
  horizontalTitle: string;
  horizontalHint: string;
};

type ToolsStripSectionProps = {
  language: Language;
  text: StripCopy;
  stripRef: React.RefObject<HTMLDivElement | null>;
};

export function ToolsStripSection({
  language,
  text,
  stripRef,
}: ToolsStripSectionProps) {
  return (
    <section className={styles.horizontalSection} data-horizontal-wrap>
      <header data-fade>
        <h2>{text.horizontalTitle}</h2>
        <p>{text.horizontalHint}</p>
      </header>
      <div className={styles.horizontalViewport}>
        <div
          className={`${styles.horizontalStrip} horizontalStrip`}
          ref={stripRef}
        >
          {tools.map((tool) => (
            <article
              className={`${styles.stripCard} stripCard`}
              key={`strip-${tool.id}`}
            >
              <tool.icon size={16} />
              <h3>{tool.name[language]}</h3>
              <p>{tool.description[language]}</p>
              <a href={`/tools?tool=${tool.id}`}>Open</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
