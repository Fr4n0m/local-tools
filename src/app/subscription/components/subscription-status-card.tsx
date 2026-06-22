import type { ReactNode } from "react";
import styles from "./subscription-status-card.module.css";

type SubscriptionStatusCardProps = {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  titleAs: "h1" | "h2";
  titleId?: string;
  description: string;
  descriptionRole?: "alert" | "status";
  children: ReactNode;
  feedback?: ReactNode;
  tone?: "default" | "success" | "error";
};

export function SubscriptionStatusCard({
  icon,
  eyebrow,
  title,
  titleAs: Title,
  titleId,
  description,
  descriptionRole,
  children,
  feedback,
  tone = "default",
}: SubscriptionStatusCardProps) {
  return (
    <section className={`${styles.card} ${styles[tone]}`}>
      <div className={styles.icon} aria-hidden>
        {icon}
      </div>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <Title id={titleId} className={styles.title}>
        {title}
      </Title>
      <p className={styles.description} role={descriptionRole}>
        {description}
      </p>
      <div className={styles.actions}>{children}</div>
      {feedback ? <div className={styles.feedback}>{feedback}</div> : null}
    </section>
  );
}
