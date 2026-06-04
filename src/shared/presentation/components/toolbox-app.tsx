"use client";

import {
  IconChevronDown,
  IconLayoutRows,
  IconLayoutDistributeVertical,
  IconLayoutDashboard,
  IconMenu2,
  IconMoon,
  IconSearch,
  IconSun,
} from "@tabler/icons-react";
import Link from "next/link";

import { AppLogo } from "@/shared/presentation/components/app-logo";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { tools } from "@/modules/tool-registry/application/tools";
import type { ToolId } from "@/modules/tool-registry/domain/tool";
import {
  resolveInitialLanguage,
  sharedMessages,
  type Language,
} from "@/shared/presentation/i18n";
import {
  readInitialTheme,
  setThemeWithTransition,
  type Theme,
} from "@/shared/lib/theme";

const toolIds = new Set<ToolId>(tools.map((tool) => tool.id));

function isToolId(value: string): value is ToolId {
  return toolIds.has(value as ToolId);
}

type Density = "comfortable" | "compact";

function readInitialDensity(): Density {
  if (typeof window === "undefined") {
    return "comfortable";
  }

  const storedDensity = window.localStorage.getItem("localtools.density");
  return storedDensity === "compact" ? "compact" : "comfortable";
}

function readToolFromUrl(): ToolId | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = new URL(window.location.href).searchParams.get("tool");
  if (!raw) {
    return null;
  }

  return isToolId(raw) ? raw : null;
}

function getInitialToolId(): ToolId {
  const fromUrl = readToolFromUrl();
  if (fromUrl) {
    return fromUrl;
  }

  const stored = window.localStorage.getItem("localtools.tool");
  if (stored && isToolId(stored)) {
    return stored;
  }

  return tools[0].id;
}

function getCategoryStyles(category: string) {
  if (category === "files-media") {
    return {
      heading: "text-sidebar-foreground/68",
      active: "text-sidebar-foreground",
      inactive:
        "text-sidebar-foreground/88 hover:text-sidebar-foreground focus-visible:text-sidebar-foreground",
      marker: "bg-sidebar-foreground",
    };
  }

  if (category === "data-encoding") {
    return {
      heading: "text-sidebar-foreground/68",
      active: "text-sidebar-foreground",
      inactive:
        "text-sidebar-foreground/88 hover:text-sidebar-foreground focus-visible:text-sidebar-foreground",
      marker: "bg-sidebar-foreground",
    };
  }

  if (category === "text-code") {
    return {
      heading: "text-sidebar-foreground/68",
      active: "text-sidebar-foreground",
      inactive:
        "text-sidebar-foreground/88 hover:text-sidebar-foreground focus-visible:text-sidebar-foreground",
      marker: "bg-sidebar-foreground",
    };
  }

  return {
    heading: "text-sidebar-foreground/68",
    active: "text-sidebar-foreground",
    inactive:
      "text-sidebar-foreground/88 hover:text-sidebar-foreground focus-visible:text-sidebar-foreground",
    marker: "bg-sidebar-foreground",
  };
}

const LANGUAGE_LABELS: Record<Language, string> = { en: "EN", es: "ES" };

export function ToolboxApp() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [selectedToolId, setSelectedToolId] = useState<ToolId>(tools[0].id);
  const [search, setSearch] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLanguage(resolveInitialLanguage());
      setTheme(readInitialTheme());
      setDensity(readInitialDensity());
      setSelectedToolId(getInitialToolId());
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("localtools.theme", theme);
  }, [theme, isReady]);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.lang = language;
    window.localStorage.setItem("localtools.language", language);
    window.dispatchEvent(
      new CustomEvent("localtools:language-change", { detail: language }),
    );
  }, [language, isReady]);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem("localtools.density", density);
    window.dispatchEvent(
      new CustomEvent("localtools:density-change", { detail: density }),
    );
  }, [density, isReady]);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem("localtools.tool", selectedToolId);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("tool", selectedToolId);
    window.history.replaceState({}, "", nextUrl);
  }, [selectedToolId, isReady]);

  useEffect(() => {
    const onPopState = () => {
      const fromUrl = readToolFromUrl();
      if (fromUrl) {
        setSelectedToolId(fromUrl);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileSidebarOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileSidebarOpen]);

  const text = sharedMessages[language];
  const toggleTheme = () =>
    setThemeWithTransition(setTheme, theme === "light" ? "dark" : "light");

  const filteredTools = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase();
    if (!trimmedSearch) {
      return tools;
    }

    return tools.filter((tool) => {
      const name = tool.name[language].toLowerCase();
      const description = tool.description[language].toLowerCase();
      return (
        name.includes(trimmedSearch) || description.includes(trimmedSearch)
      );
    });
  }, [language, search]);

  const selectedTool =
    tools.find((tool) => tool.id === selectedToolId) ?? tools[0];
  const SelectedToolComponent = selectedTool.component;

  return (
    <div
      className={`min-h-screen text-foreground ${density === "compact" ? "density-compact" : ""}`}
    >
      <a className="skip-link" href="#main-content">
        {text.skipToContent}
      </a>
      <div className="flex min-h-screen md:gap-3 md:p-3">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="relative h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-transparent dark:border-white/22 bg-sidebar text-sidebar-foreground shadow-[0_42px_90px_-36px_rgba(0,0,0,0.72),0_12px_28px_-18px_rgba(0,0,0,0.55)]">
            <Sidebar
              density={density}
              language={language}
              search={search}
              theme={theme}
              onDensityToggle={() =>
                setDensity(
                  density === "comfortable" ? "compact" : "comfortable",
                )
              }
              onLanguageSelect={(lang) => setLanguage(lang)}
              onSearchChange={setSearch}
              onSelectTool={setSelectedToolId}
              onThemeToggle={toggleTheme}
              selectedToolId={selectedToolId}
              toolsToRender={filteredTools}
            />
          </div>
        </aside>

        {isMobileSidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            role="presentation"
          >
            <aside
              aria-label={text.menu}
              className="h-full w-72 border-r border-transparent dark:border-white/22 bg-sidebar text-sidebar-foreground"
              id="mobile-sidebar"
              onClick={(event) => event.stopPropagation()}
              aria-modal="true"
              role="dialog"
            >
              <Sidebar
                density={density}
                language={language}
                search={search}
                theme={theme}
                onDensityToggle={() =>
                  setDensity(
                    density === "comfortable" ? "compact" : "comfortable",
                  )
                }
                onLanguageSelect={() =>
                  setLanguage(language === "en" ? "es" : "en")
                }
                onSearchChange={setSearch}
                onSelectTool={(toolId) => {
                  setSelectedToolId(toolId);
                  setIsMobileSidebarOpen(false);
                }}
                onThemeToggle={toggleTheme}
                selectedToolId={selectedToolId}
                toolsToRender={filteredTools}
              />
            </aside>
          </div>
        ) : null}

        <main
          className="flex-1 p-4 md:rounded-2xl md:border md:border-border/35 dark:md:border-white/22 md:bg-background/85 md:p-8"
          id="main-content"
          tabIndex={-1}
        >
          <header className="mb-6 md:hidden">
            <button
              aria-controls="mobile-sidebar"
              aria-expanded={isMobileSidebarOpen}
              className="rounded-md border border-border/60 dark:border-white/22 bg-panel/40 p-2"
              onClick={() => setIsMobileSidebarOpen(true)}
              type="button"
              aria-label={text.menu}
            >
              <IconMenu2 size={18} />
            </button>
          </header>

          <section className="tool-shell rounded-lg border border-border/50 dark:border-white/22 bg-background/90 p-4 md:p-6">
            <SelectedToolComponent language={language} />
          </section>
          <aside className="mt-3 rounded-md border border-border/40 dark:border-white/22 bg-panel/20 px-3 py-2 text-xs text-foreground/75">
            <details>
              <summary className="privacy-summary cursor-pointer select-none font-medium">
                <span>{text.privacyTitle}</span>
                <IconChevronDown
                  aria-hidden
                  className="privacy-summary__icon"
                  size={14}
                />
              </summary>
              <p className="mt-2 text-foreground/80">{text.privacy}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/80">
                <li>{text.privacyItems.local}</li>
                <li>{text.privacyItems.upload}</li>
                <li>{text.privacyItems.tracking}</li>
                <li>{text.privacyItems.auth}</li>
              </ul>
            </details>
          </aside>
        </main>
      </div>
    </div>
  );
}

type SidebarProps = {
  density: Density;
  language: Language;
  search: string;
  theme: Theme;
  onDensityToggle: () => void;
  onLanguageSelect: (lang: Language) => void;
  onSearchChange: (value: string) => void;
  onSelectTool: (toolId: ToolId) => void;
  onThemeToggle: () => void;
  selectedToolId: ToolId;
  toolsToRender: typeof tools;
};

function Sidebar({
  density,
  language,
  search,
  theme,
  onDensityToggle,
  onLanguageSelect,
  onSearchChange,
  onSelectTool,
  onThemeToggle,
  selectedToolId,
  toolsToRender,
}: SidebarProps) {
  const text = sharedMessages[language];

  const grouped = useMemo(
    () =>
      toolsToRender.reduce<Record<string, typeof tools>>((acc, tool) => {
        if (!acc[tool.category]) {
          acc[tool.category] = [];
        }
        acc[tool.category].push(tool);
        return acc;
      }, {}),
    [toolsToRender],
  );

  return (
    <nav
      aria-label={text.toolsNavigation}
      className="aside-fade-mask hide-scrollbar h-full space-y-4 overflow-y-auto px-3 py-5"
    >
      <div className="flex items-center justify-between px-1">
        <Link aria-label="Go to home" className="inline-flex" href="/">
          <AppLogo className="text-sidebar-foreground" />
        </Link>
        <div className="flex items-center gap-0.5 rounded-lg bg-black p-0.5">
          <button
            aria-label={text.language}
            className="flex h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/12 hover:text-sidebar-foreground"
            onClick={() => onLanguageSelect(language === "en" ? "es" : "en")}
            title={
              language === "en" ? "Switch to Español" : "Switch to English"
            }
            type="button"
          >
            <span
              aria-hidden
              className="font-heading text-[10px] font-bold tracking-[0.08em]"
            >
              {LANGUAGE_LABELS[language]}
            </span>
          </button>
          <button
            aria-label={text.density}
            className="flex h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/12 hover:text-sidebar-foreground"
            onClick={onDensityToggle}
            title={`${text.density}: ${density === "compact" ? text.compact : text.comfortable}`}
            type="button"
          >
            {density === "compact" ? (
              <IconLayoutRows size={13} />
            ) : (
              <IconLayoutDistributeVertical size={13} />
            )}
          </button>
          <button
            aria-label={text.theme}
            className="flex h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/12 hover:text-sidebar-foreground"
            onClick={onThemeToggle}
            type="button"
          >
            {theme === "light" ? <IconMoon size={13} /> : <IconSun size={13} />}
          </button>
        </div>
      </div>
      <div className="relative px-1">
        <IconSearch
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sidebar-foreground/65"
          size={16}
        />
        <input
          aria-label={text.searchPlaceholder}
          className="aside-search h-8 w-full rounded-md border border-sidebar-foreground/20 bg-sidebar/40 py-1.5 pl-10 pr-3 text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/55"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={text.searchPlaceholder}
          value={search}
        />
      </div>
      {toolsToRender.length === 0 ? (
        <p className="px-1 text-sm text-sidebar-foreground/85">
          {text.emptySearch}
        </p>
      ) : null}
      {Object.entries(grouped).map(([category, categoryTools]) => (
        <CategorySection
          category={category}
          categoryTools={categoryTools}
          key={category}
          language={language}
          onSelectTool={onSelectTool}
          selectedToolId={selectedToolId}
          title={text.categories[category as keyof typeof text.categories]}
        />
      ))}
      <div className="mt-2 border-t border-sidebar-foreground/14 pt-3">
        <Link
          className="aside-tool-btn group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-sidebar-foreground/88 hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-foreground"
          href="/"
        >
          <span aria-hidden className="tool-marker-dot h-1.5 w-1.5" />
          <span aria-hidden className="shrink-0">
            <IconLayoutDashboard size={15} />
          </span>
          <span className="font-medium">Home</span>
        </Link>
      </div>
    </nav>
  );
}

type CategorySectionProps = {
  category: string;
  categoryTools: typeof tools;
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
  selectedToolId: ToolId;
  title: string;
};

function CategorySection({
  category,
  categoryTools,
  language,
  onSelectTool,
  selectedToolId,
  title,
}: CategorySectionProps) {
  const styles = getCategoryStyles(category);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [markerY, setMarkerY] = useState(0);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const active = root.querySelector<HTMLButtonElement>(
      `[data-tool-id="${selectedToolId}"]`,
    );

    if (!active) {
      setVisible(false);
      return;
    }

    const nextY = active.offsetTop + active.offsetHeight / 2 - 3;
    setMarkerY(nextY);
    setVisible(true);
  }, [categoryTools, selectedToolId]);

  return (
    <div className="space-y-2">
      <p
        className={`px-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${styles.heading}`}
      >
        {title}
      </p>
      <div className="relative space-y-0.5" ref={rootRef}>
        <span
          aria-hidden
          className={`tool-marker-dot pointer-events-none absolute left-2 h-1.5 w-1.5 transition-transform duration-200 ease-out motion-reduce:transition-none ${styles.marker} ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ transform: `translateY(${markerY}px)` }}
        />
        {categoryTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.id === selectedToolId;
          return (
            <button
              aria-pressed={isActive}
              className={`aside-tool-btn group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-foreground ${isActive ? `${styles.active} font-semibold` : styles.inactive}`}
              data-tool-id={tool.id}
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              type="button"
            >
              <span aria-hidden className="tool-marker-dot h-1.5 w-1.5" />
              <span aria-hidden className="shrink-0">
                <Icon size={15} />
              </span>
              <span className="font-medium">{tool.name[language]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
