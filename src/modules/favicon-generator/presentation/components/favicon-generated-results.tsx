"use client";

import Image from "next/image";
import {
  IconBrandAndroid,
  IconBrandApple,
  IconBraces,
  IconBrowser,
  IconChevronDown,
  IconClipboardText,
  IconDownload,
  IconFileCode,
  IconPackage,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

import type { GeneratedIcon } from "@/modules/favicon-generator/application/favicon-rendering";
import { ToolActions } from "@/shared/presentation/components/tool-actions";
import { ToolTextarea } from "@/shared/presentation/components/tool-form";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/lib/utils";

type CopyDownloadLabels = {
  copy: string;
  download?: string;
};

type Props = {
  icons: GeneratedIcon[];
  resultLabel: string;
  resultCountLabel: string;
  groupLabels: {
    browser: string;
    apple: string;
    android: string;
  };
  technicalFilesLabel: string;
  technicalFilesDescription: string;
  downloadPackageLabel: string;
  downloadPackageHint: string;
  manifest: { label: string; content: string; actions: CopyDownloadLabels };
  browserConfig: {
    label: string;
    content: string;
    actions: CopyDownloadLabels;
  };
  snippet: { label: string; content: string; actions: CopyDownloadLabels };
  onCopy: (content: string) => void;
  onDownloadManifest: () => void;
  onDownloadBrowserConfig: () => void;
  onDownloadPackage: () => void;
  compact?: boolean;
};

type IconGroup = {
  key: "browser" | "apple" | "android";
  icon: ReactNode;
  items: GeneratedIcon[];
};

function GeneratedIconCard({
  icon,
  compact,
}: {
  icon: GeneratedIcon;
  compact: boolean;
}) {
  const isDark = icon.fileName.includes("-dark");
  const isMaskable = icon.fileName.includes("maskable");

  return (
    <a
      className={cn(
        "group grid min-w-0 items-center rounded-2xl bg-[var(--tool-control-bg)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[var(--tool-control-hover-bg)]",
        compact
          ? "grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-2 p-2"
          : "grid-cols-[3.5rem_minmax(0,1fr)_auto] gap-3 p-3",
      )}
      download={icon.fileName}
      href={icon.url}
    >
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-background/70 dark:bg-white/[0.06]",
          compact ? "h-10 w-10" : "h-14 w-14",
        )}
      >
        <Image
          alt=""
          className={cn("object-contain", compact ? "h-8 w-8" : "h-10 w-10")}
          height={40}
          src={icon.url}
          unoptimized
          width={40}
        />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-1.5">
          <strong className="text-sm text-foreground">
            {icon.size} × {icon.size}
          </strong>
          {isDark ? (
            <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/65">
              Dark
            </span>
          ) : null}
          {isMaskable ? (
            <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/65">
              Maskable
            </span>
          ) : null}
        </span>
        <span className="mt-1 block truncate text-xs text-foreground/58">
          {icon.fileName}
        </span>
      </span>
      <IconDownload
        aria-hidden
        className="h-5 w-5 text-foreground/45 transition-transform group-hover:translate-y-0.5 group-hover:text-foreground"
      />
    </a>
  );
}

function GeneratedIconGroup({
  group,
  label,
  compact,
}: {
  group: IconGroup;
  label: string;
  compact: boolean;
}) {
  if (group.items.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-3xl bg-[var(--tool-control-bg)]",
        compact ? "space-y-2 p-3" : "space-y-3 p-4 sm:p-5",
      )}
    >
      <div className="flex items-center gap-2 text-foreground">
        <span className="text-foreground/65">{group.icon}</span>
        <h4 className="font-semibold">{label}</h4>
        <span className="text-xs tabular-nums text-foreground/48">
          {group.items.length}
        </span>
      </div>
      <div
        className={cn(
          "grid gap-2",
          compact
            ? "[grid-template-columns:repeat(auto-fill,minmax(min(100%,12rem),1fr))]"
            : "[grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]",
        )}
      >
        {group.items.map((icon) => (
          <GeneratedIconCard
            compact={compact}
            icon={icon}
            key={icon.fileName}
          />
        ))}
      </div>
    </section>
  );
}

function TechnicalFile({
  actions,
  content,
  icon,
  label,
  onCopy,
  onDownload,
}: {
  actions: CopyDownloadLabels;
  content: string;
  icon: ReactNode;
  label: string;
  onCopy: () => void;
  onDownload?: () => void;
}) {
  return (
    <details className="group rounded-2xl bg-[var(--tool-control-bg)] open:bg-[var(--tool-control-hover-bg)]">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:content-none">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-background/70 text-foreground/70 dark:bg-white/[0.06]">
          {icon}
        </span>
        <span className="min-w-0 flex-1 font-semibold text-foreground">
          {label}
        </span>
        <IconChevronDown
          aria-hidden
          className="h-5 w-5 text-foreground/50 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="space-y-3 px-4 pb-4">
        <ToolTextarea className="h-44 text-xs" readOnly value={content} />
        <ToolActions
          actions={[
            {
              label: actions.copy,
              onClick: onCopy,
              disabled: content.length === 0,
              icon: <IconClipboardText className="h-4 w-4" />,
            },
            ...(actions.download && onDownload
              ? [
                  {
                    label: actions.download,
                    onClick: onDownload,
                    disabled: content.length === 0,
                    icon: <IconDownload className="h-4 w-4" />,
                  },
                ]
              : []),
          ]}
        />
      </div>
    </details>
  );
}

export function FaviconGeneratedResults({
  icons,
  resultLabel,
  resultCountLabel,
  groupLabels,
  technicalFilesLabel,
  technicalFilesDescription,
  downloadPackageLabel,
  downloadPackageHint,
  manifest,
  browserConfig,
  snippet,
  onCopy,
  onDownloadManifest,
  onDownloadBrowserConfig,
  onDownloadPackage,
  compact = false,
}: Props) {
  const groups: IconGroup[] = [
    {
      key: "browser",
      icon: <IconBrowser className="h-5 w-5" />,
      items: icons.filter(
        (icon) =>
          !icon.fileName.includes("apple") &&
          !icon.fileName.includes("android"),
      ),
    },
    {
      key: "apple",
      icon: <IconBrandApple className="h-5 w-5" />,
      items: icons.filter((icon) => icon.fileName.includes("apple")),
    },
    {
      key: "android",
      icon: <IconBrandAndroid className="h-5 w-5" />,
      items: icons.filter((icon) => icon.fileName.includes("android")),
    },
  ];

  return (
    <section
      className={cn(compact ? "space-y-4" : "space-y-7")}
      aria-labelledby="favicon-results-title"
    >
      <header className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--tool-control-bg)] text-foreground">
          <IconPackage className="h-6 w-6" />
        </span>
        <div>
          <h3 className="text-xl font-semibold" id="favicon-results-title">
            {resultLabel}
          </h3>
          <p className="text-sm text-foreground/55">
            {resultCountLabel.replace("{count}", String(icons.length))}
          </p>
        </div>
      </header>

      <div className="grid gap-4">
        {groups.map((group) => (
          <GeneratedIconGroup
            group={group}
            key={group.key}
            label={groupLabels[group.key]}
            compact={compact}
          />
        ))}
      </div>

      <section className="space-y-3 border-t border-border/55 pt-6">
        <div className="flex items-start gap-3">
          <IconFileCode className="mt-0.5 h-5 w-5 text-foreground/60" />
          <div>
            <h4 className="font-semibold">{technicalFilesLabel}</h4>
            <p className="text-sm text-foreground/55">
              {technicalFilesDescription}
            </p>
          </div>
        </div>
        <div className="grid gap-2 xl:grid-cols-3">
          <TechnicalFile
            actions={manifest.actions}
            content={manifest.content}
            icon={<IconBraces className="h-5 w-5" />}
            label={manifest.label}
            onCopy={() => onCopy(manifest.content)}
            onDownload={onDownloadManifest}
          />
          <TechnicalFile
            actions={browserConfig.actions}
            content={browserConfig.content}
            icon={<IconFileCode className="h-5 w-5" />}
            label={browserConfig.label}
            onCopy={() => onCopy(browserConfig.content)}
            onDownload={onDownloadBrowserConfig}
          />
          <TechnicalFile
            actions={snippet.actions}
            content={snippet.content}
            icon={<IconBraces className="h-5 w-5" />}
            label={snippet.label}
            onCopy={() => onCopy(snippet.content)}
          />
        </div>
      </section>

      <footer className="flex flex-col gap-4 rounded-3xl bg-[var(--tool-control-bg)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{resultLabel}</p>
          <p className="mt-1 text-sm text-foreground/55">
            {downloadPackageHint}
          </p>
        </div>
        <Button
          className="w-full shrink-0 sm:w-auto"
          onClick={onDownloadPackage}
          type="button"
        >
          <IconDownload aria-hidden className="h-4 w-4" />
          {downloadPackageLabel}
        </Button>
      </footer>
    </section>
  );
}
