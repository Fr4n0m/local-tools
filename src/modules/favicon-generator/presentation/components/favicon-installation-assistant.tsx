"use client";

import { useMemo, useState } from "react";
import {
  IconBrandReact,
  IconCheck,
  IconClipboardText,
  IconCode,
  IconRobot,
  IconSearch,
  IconWorldCheck,
  IconX,
} from "@tabler/icons-react";

import {
  buildAiInstallationPrompt,
  buildInstallationGuide,
  FAVICON_INTEGRATION_TARGETS,
  type FaviconIntegrationTarget,
  type FaviconInstallationLanguage,
} from "@/modules/favicon-generator/domain/favicon-installation";
import { cn } from "@/shared/lib/utils";
import {
  ToolInput,
  ToolTextarea,
} from "@/shared/presentation/components/tool-form";
import { SegmentedControl } from "@/shared/presentation/components/segmented-control";
import { Button } from "@/shared/presentation/components/ui/button";

type InstallationText = {
  title: string;
  description: string;
  technology: string;
  guide: string;
  copyGuide: string;
  aiTitle: string;
  aiDescription: string;
  copyPrompt: string;
  checkerTitle: string;
  checkerDescription: string;
  urlLabel: string;
  urlPlaceholder: string;
  check: string;
  checking: string;
  checkSuccess: string;
  checkPartial: string;
  checkError: string;
  statusIcon: string;
  statusApple: string;
  statusManifest: string;
  technologies: Record<FaviconIntegrationTarget, string>;
};

type CheckSummary = {
  icon: boolean;
  apple: boolean;
  manifest: boolean;
  config: boolean;
};

type CheckResult = {
  ok: boolean;
  summary: CheckSummary;
};

function StatusItem({ label, ok }: { label: string; ok: boolean }) {
  const Icon = ok ? IconCheck : IconX;
  return (
    <li className="flex min-w-0 items-center gap-3 rounded-xl bg-background/60 px-3 py-3 text-sm dark:bg-[#101010]">
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
          ok
            ? "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300"
            : "bg-red-500/12 text-red-700 dark:bg-red-400/12 dark:text-red-300",
        )}
      >
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span className="min-w-0 font-medium">{label}</span>
    </li>
  );
}

export function FaviconInstallationAssistant({
  faviconPath,
  htmlSnippet,
  language,
  onCopy,
  onTargetChange,
  target,
  text,
}: {
  faviconPath: string;
  htmlSnippet: string;
  language: FaviconInstallationLanguage;
  onCopy: (content: string) => void;
  onTargetChange: (target: FaviconIntegrationTarget) => void;
  target: FaviconIntegrationTarget;
  text: InstallationText;
}) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [checkState, setCheckState] = useState<
    | { status: "idle" | "loading" | "error" }
    | { status: "complete"; result: CheckResult }
  >({ status: "idle" });

  const installationOptions = useMemo(
    () => ({ target, language, htmlSnippet, faviconPath }),
    [faviconPath, htmlSnippet, language, target],
  );
  const guide = useMemo(
    () => buildInstallationGuide(installationOptions),
    [installationOptions],
  );
  const aiPrompt = useMemo(
    () => buildAiInstallationPrompt(installationOptions),
    [installationOptions],
  );

  const checkWebsite = async () => {
    setCheckState({ status: "loading" });
    try {
      const response = await fetch("/api/favicon-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });
      if (!response.ok) throw new Error("favicon-check-failed");
      const result = (await response.json()) as CheckResult;
      setCheckState({ status: "complete", result });
    } catch {
      setCheckState({ status: "error" });
    }
  };

  return (
    <section
      className="space-y-4 border-t border-border/55 pt-6"
      aria-labelledby="favicon-installation-title"
    >
      <header className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--tool-control-bg)] text-foreground/75">
          <IconCode aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <h4 className="text-lg font-semibold" id="favicon-installation-title">
            {text.title}
          </h4>
          <p className="text-sm text-foreground/55">{text.description}</p>
        </div>
      </header>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground/75">
          {text.technology}
        </p>
        <div className="overflow-x-auto pb-1 pr-1">
          <SegmentedControl
            aria-label={text.technology}
            className="min-w-[760px]"
            onChange={onTargetChange}
            options={FAVICON_INTEGRATION_TARGETS.map((technology) => ({
              value: technology,
              label: text.technologies[technology],
            }))}
            value={target}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="grid min-w-0 content-start gap-3 rounded-2xl bg-[var(--tool-control-bg)] p-4">
          <div className="flex items-center gap-2">
            <IconBrandReact
              aria-hidden
              className="h-5 w-5 text-foreground/60"
            />
            <h5 className="font-semibold">{text.guide}</h5>
          </div>
          <ToolTextarea
            aria-label={text.guide}
            className="h-72 resize-none whitespace-pre-wrap font-mono text-xs leading-5 text-foreground/75"
            readOnly
            spellCheck={false}
            value={guide}
          />
          <Button
            className="w-fit"
            onClick={() => onCopy(guide)}
            size="sm"
            type="button"
            variant="outline"
          >
            <IconClipboardText aria-hidden className="h-4 w-4" />
            {text.copyGuide}
          </Button>
        </article>

        <article className="grid min-w-0 content-start gap-3 rounded-2xl bg-[var(--tool-control-bg)] p-4">
          <div className="flex items-center gap-2">
            <IconRobot aria-hidden className="h-5 w-5 text-foreground/60" />
            <h5 className="font-semibold">{text.aiTitle}</h5>
          </div>
          <p className="text-sm text-foreground/55">{text.aiDescription}</p>
          <ToolTextarea
            aria-label={text.aiTitle}
            className="h-60 resize-none whitespace-pre-wrap font-mono text-xs leading-5 text-foreground/75"
            readOnly
            spellCheck={false}
            value={aiPrompt}
          />
          <Button
            className="w-fit"
            onClick={() => onCopy(aiPrompt)}
            size="sm"
            type="button"
          >
            <IconClipboardText aria-hidden className="h-4 w-4" />
            {text.copyPrompt}
          </Button>
        </article>
      </div>

      <article className="rounded-2xl bg-[var(--tool-control-bg)] p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <IconWorldCheck
              aria-hidden
              className="h-5 w-5 text-foreground/60"
            />
            <h5 className="font-semibold">{text.checkerTitle}</h5>
          </div>
          <p className="mt-1 text-sm text-foreground/55">
            {text.checkerDescription}
          </p>
          <form
            className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              void checkWebsite();
            }}
          >
            <label className="grid min-w-0 gap-1 text-sm font-medium">
              <span>{text.urlLabel}</span>
              <ToolInput
                className="h-[var(--button-height)] py-0"
                inputMode="url"
                onChange={(event) => {
                  setWebsiteUrl(event.target.value);
                  setCheckState({ status: "idle" });
                }}
                placeholder={text.urlPlaceholder}
                required
                type="url"
                value={websiteUrl}
              />
            </label>
            <Button
              className="favicon-check-button h-[var(--button-height)] min-w-44 self-end"
              disabled={!websiteUrl.trim() || checkState.status === "loading"}
              type="submit"
            >
              <IconSearch aria-hidden className="h-4 w-4" />
              {checkState.status === "loading" ? text.checking : text.check}
            </Button>
          </form>

          {checkState.status === "error" ? (
            <p
              className="mt-3 text-sm font-medium text-red-600 dark:text-red-400"
              role="alert"
            >
              {text.checkError}
            </p>
          ) : null}
          {checkState.status === "complete" ? (
            <div
              className="mt-4 rounded-2xl bg-secondary/60 p-3 dark:bg-[#181818]"
              role="status"
            >
              <p
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold",
                  checkState.result.ok
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-300",
                )}
              >
                {checkState.result.ok ? (
                  <IconCheck aria-hidden className="h-4 w-4" />
                ) : null}
                {checkState.result.ok ? text.checkSuccess : text.checkPartial}
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                <StatusItem
                  label={text.statusIcon}
                  ok={checkState.result.summary.icon}
                />
                <StatusItem
                  label={text.statusApple}
                  ok={checkState.result.summary.apple}
                />
                <StatusItem
                  label={text.statusManifest}
                  ok={checkState.result.summary.manifest}
                />
              </ul>
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}
