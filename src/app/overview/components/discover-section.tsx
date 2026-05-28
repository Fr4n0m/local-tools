"use client";

import styles from "./discover-section.module.css";

type DiscoverCopy = {
  finalTitle: string;
  finalText: string;
  subscribe: string;
  subscribeText: string;
  subscribeButton: string;
  subscribePlaceholder: string;
};

type DiscoverSectionProps = {
  text: DiscoverCopy;
};

export function DiscoverSection({ text }: DiscoverSectionProps) {
  return (
    <section className={styles.finalSection} data-fade id="subscribe-updates">
      <h2>{text.finalTitle}</h2>
      <p>{text.finalText}</p>
      <div className={styles.finalCards}>
        <article>
          <h3>Community</h3>
          <p>GitHub discussions, issues, and PR contributions.</p>
          <a
            href="https://github.com/Fr4n0m/local-tools"
            rel="noreferrer"
            target="_blank"
          >
            Repository
          </a>
        </article>
        <article>
          <h3>Roadmap</h3>
          <p>Transparent feature priorities tied to real implementation.</p>
          <a
            href="https://github.com/Fr4n0m/local-tools/issues"
            rel="noreferrer"
            target="_blank"
          >
            Issues
          </a>
        </article>
        <article>
          <h3>{text.subscribe}</h3>
          <p>{text.subscribeText}</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input placeholder={text.subscribePlaceholder} type="email" />
            <button type="submit">{text.subscribeButton}</button>
          </form>
        </article>
      </div>
    </section>
  );
}
