"use client";

import type { ReactNode } from "react";

import { MobileHomeMock } from "@/shared/presentation/components/mobile-home-mock";

type PreviewIcon = React.ComponentType<{ className?: string }>;

export function PreviewHeading({
  icon: Icon,
  label,
}: {
  icon: PreviewIcon;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/72">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}

export function MobilePreviewCard({
  iconUrl,
  appLabel,
  platform,
  dark = false,
  language,
}: {
  iconUrl: string | null;
  appLabel: string;
  platform: "ios" | "android";
  dark?: boolean;
  language: "en" | "es";
}) {
  return (
    <MobileHomeMock
      appIconUrl={iconUrl}
      appName={appLabel}
      language={language}
      platform={platform}
      theme={dark ? "dark" : "light"}
    />
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
    <section className="space-y-3">
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

export function PreviewSettingsField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground/78">{label}</span>
      {children}
    </label>
  );
}
