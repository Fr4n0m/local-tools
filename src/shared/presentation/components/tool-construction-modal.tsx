"use client";

import { useEffect, useId, useRef } from "react";
import { IconBarrierBlock, IconX } from "@tabler/icons-react";

import styles from "./tool-construction-modal.module.css";

type ToolConstructionModalProps = {
  actionLabel: string;
  closeLabel: string;
  description: string;
  eyebrow: string;
  onClose: () => void;
  title: string;
};

export function ToolConstructionModal({
  actionLabel,
  closeLabel,
  description,
  eyebrow,
  onClose,
  title,
}: ToolConstructionModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => {
      actionRef.current?.focus();
    });

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const first = closeRef.current;
      const last = actionRef.current;
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
      >
        <button
          aria-label={closeLabel}
          className={styles.close}
          onClick={onClose}
          ref={closeRef}
          type="button"
        >
          <IconX aria-hidden />
        </button>
        <div aria-hidden className={styles.icon}>
          <IconBarrierBlock />
        </div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        <p className={styles.description} id={descriptionId}>
          {description}
        </p>
        <button
          className={styles.action}
          onClick={onClose}
          ref={actionRef}
          type="button"
        >
          {actionLabel}
        </button>
      </section>
    </div>
  );
}
