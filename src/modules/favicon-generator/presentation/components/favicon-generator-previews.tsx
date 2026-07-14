"use client";

import type { ReactNode } from "react";
import { IconMoonStars, IconSunHigh } from "@tabler/icons-react";

import { MobileHomeMock } from "@/shared/presentation/components/mobile-home-mock";

type PreviewIcon = React.ComponentType<{ className?: string }>;

export function PreviewHeading({
  icon: Icon,
  label,
  subtle = false,
}: {
  icon: PreviewIcon;
  label: string;
  subtle?: boolean;
}) {
  if (subtle) {
    return (
      <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/65">
        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <h2 className="inline-flex items-center gap-3 text-[1.625rem] font-semibold tracking-[-0.04em] text-foreground">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary/55 text-foreground/78 dark:bg-[#1b1b1b]">
        <Icon aria-hidden="true" className="h-5.5 w-5.5" />
      </span>
      <span>{label}</span>
    </h2>
  );
}

export function MobilePreviewCard({
  iconUrl,
  appLabel,
  modeLabel,
  platform,
  dark = false,
  language,
}: {
  iconUrl: string | null;
  appLabel: string;
  modeLabel: string;
  platform: "ios" | "android";
  dark?: boolean;
  language: "en" | "es";
}) {
  return (
    <PreviewModeCard
      className={dark ? "dark:bg-[#202020]" : "dark:bg-[#1b1b1b]"}
      dark={dark}
      label={modeLabel}
    >
      <MobileHomeMock
        appIconUrl={iconUrl}
        appName={appLabel}
        language={language}
        platform={platform}
        theme={dark ? "dark" : "light"}
      />
    </PreviewModeCard>
  );
}

export function PreviewModeCard({
  children,
  className,
  dark = false,
  label,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  label: string;
}) {
  const ModeIcon = dark ? IconMoonStars : IconSunHigh;

  return (
    <article
      className={`grid min-w-0 grid-rows-[auto_1fr] gap-3 rounded-2xl p-3 ${
        dark ? "bg-secondary/70" : "bg-secondary/45"
      } ${className ?? ""}`}
    >
      <header className="flex items-center justify-center gap-2 text-sm font-semibold tracking-[-0.01em] text-foreground/85">
        <ModeIcon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        <span>{label}</span>
      </header>
      {children}
    </article>
  );
}

export function PreviewSection({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {header}
      </div>
      {children}
    </section>
  );
}

export function PreviewSubtleStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function PreviewSettingsPanel({ children }: { children: ReactNode }) {
  return <div className="p-0 lg:pl-2">{children}</div>;
}
