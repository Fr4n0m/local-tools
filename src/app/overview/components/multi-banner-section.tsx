"use client";

import styles from "./multi-banner-section.module.css";

export function MultiBannerSection() {
  return (
    <section className={styles.multiBanner} data-fade>
      <div className={styles.multiBannerShell}>
        <header className={styles.multiBannerHead}>
          <p className={styles.storyEyebrow}>Product capabilities</p>
          <h2>One interface. Multiple real workflows.</h2>
          <p>
            LocalTools groups daily micro-operations into focused modules.
            Switch contexts fast without leaving your browser.
          </p>
        </header>
        <div className={styles.multiBannerGrid}>
          <article className={styles.bannerA}>
            <h3>Files & Media</h3>
            <p>Convert, compress, and transform assets in seconds.</p>
          </article>
          <article className={styles.bannerB}>
            <h3>Data & Encoding</h3>
            <p>Validate payloads, encode values, and avoid broken formats.</p>
          </article>
          <article className={styles.bannerC}>
            <h3>Text & Code</h3>
            <p>Prepare docs, prompts, snippets, and structured output.</p>
          </article>
          <article className={styles.bannerD}>
            <h3>Advanced Utilities</h3>
            <p>Specialized controls for design, timing, and visual tooling.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
