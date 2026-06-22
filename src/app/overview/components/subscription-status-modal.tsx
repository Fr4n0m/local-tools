"use client";

import { useEffect, useId, useRef } from "react";
import { IconAlertTriangle, IconCircleCheck, IconX } from "@tabler/icons-react";
import { SubscriptionStatusCard } from "@/app/subscription/components/subscription-status-card";
import type { SubscriptionStatus } from "../subscription-status";
import styles from "./subscription-status-modal.module.css";

export type SubscriptionStatusModalText = {
  confirmedEyebrow: string;
  confirmedTitle: string;
  confirmedDescription: string;
  confirmedAction: string;
  errorEyebrow: string;
  errorTitle: string;
  errorDescription: string;
  errorAction: string;
  closeLabel: string;
};

type SubscriptionStatusModalProps = {
  status: SubscriptionStatus;
  text: SubscriptionStatusModalText;
  onClose: () => void;
  onPrimaryAction: () => void;
};

export function SubscriptionStatusModal({
  status,
  text,
  onClose,
  onPrimaryAction,
}: SubscriptionStatusModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => {
      closeRef.current?.focus();
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
      const last = primaryRef.current;
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

  const isConfirmed = status === "confirmed";
  const title = isConfirmed ? text.confirmedTitle : text.errorTitle;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeRef}
          className={styles.close}
          type="button"
          aria-label={text.closeLabel}
          onClick={onClose}
        >
          <IconX aria-hidden />
        </button>
        <SubscriptionStatusCard
          icon={
            isConfirmed ? (
              <IconCircleCheck aria-hidden />
            ) : (
              <IconAlertTriangle aria-hidden />
            )
          }
          eyebrow={isConfirmed ? text.confirmedEyebrow : text.errorEyebrow}
          title={title}
          titleAs="h2"
          titleId={titleId}
          description={
            isConfirmed ? text.confirmedDescription : text.errorDescription
          }
          tone={isConfirmed ? "success" : "error"}
        >
          <button ref={primaryRef} type="button" onClick={onPrimaryAction}>
            {isConfirmed ? text.confirmedAction : text.errorAction}
          </button>
        </SubscriptionStatusCard>
      </div>
    </div>
  );
}
