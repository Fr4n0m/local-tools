"use client";

import {
  IconHeart,
  IconMenu2,
  IconMoon,
  IconSearch,
  IconSun,
} from "@tabler/icons-react";

import { ToolSelect } from "@/shared/presentation/components/tool-form";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { tools } from "@/modules/tool-registry/application/tools";
import type { ToolId } from "@/modules/tool-registry/domain/tool";
import {
  resolveInitialLanguage,
  sharedMessages,
  type Language,
} from "@/shared/presentation/i18n";

const toolIds = new Set<ToolId>(tools.map((tool) => tool.id));

function isToolId(value: string): value is ToolId {
  return toolIds.has(value as ToolId);
}

type Theme = "light" | "dark";
type Density = "comfortable" | "compact";

function readInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("localtools.theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

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

export function ToolboxApp() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [selectedToolId, setSelectedToolId] = useState<ToolId>(tools[0].id);
  const [search, setSearch] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLanguage(resolveInitialLanguage());
      setTheme(readInitialTheme());
      setDensity(readInitialDensity());
      setSelectedToolId(getInitialToolId());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("localtools.theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("localtools.language", language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("localtools.density", density);
  }, [density]);

  useEffect(() => {
    window.localStorage.setItem("localtools.tool", selectedToolId);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("tool", selectedToolId);
    window.history.replaceState({}, "", nextUrl);
  }, [selectedToolId]);

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
      className={`min-h-screen bg-background text-foreground ${density === "compact" ? "density-compact" : ""}`}
    >
      <a className="skip-link" href="#main-content">
        {text.skipToContent}
      </a>
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-border/60 bg-sidebar text-sidebar-foreground md:block">
          <Sidebar
            language={language}
            search={search}
            onSearchChange={setSearch}
            onSelectTool={setSelectedToolId}
            selectedToolId={selectedToolId}
            toolsToRender={filteredTools}
          />
        </aside>

        {isMobileSidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            role="presentation"
          >
            <aside
              aria-label={text.menu}
              className="h-full w-72 border-r border-border/60 bg-sidebar text-sidebar-foreground"
              id="mobile-sidebar"
              onClick={(event) => event.stopPropagation()}
              aria-modal="true"
              role="dialog"
            >
              <Sidebar
                language={language}
                search={search}
                onSearchChange={setSearch}
                onSelectTool={(toolId) => {
                  setSelectedToolId(toolId);
                  setIsMobileSidebarOpen(false);
                }}
                selectedToolId={selectedToolId}
                toolsToRender={filteredTools}
              />
            </aside>
          </div>
        ) : null}

        <main
          className="flex-1 bg-background p-4 md:p-8"
          id="main-content"
          tabIndex={-1}
        >
          <header className="mb-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  aria-controls="mobile-sidebar"
                  aria-expanded={isMobileSidebarOpen}
                  className="rounded-md border border-border/60 bg-panel/40 p-2 md:hidden"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  type="button"
                  aria-label={text.menu}
                >
                  <IconMenu2 size={18} />
                </button>
                <h1 className="text-2xl font-bold text-primary">
                  {text.appTitle}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <ToolSelect
                  aria-label={text.language}
                  className="w-24"
                  options={[
                    { value: "en", label: "EN" },
                    { value: "es", label: "ES" },
                  ]}
                  size="sm"
                  value={language}
                  onChange={(val) => setLanguage(val as Language)}
                />
                <button
                  className="h-10 rounded-md border border-border/60 bg-background px-3 text-xs font-medium"
                  onClick={() =>
                    setDensity(
                      density === "comfortable" ? "compact" : "comfortable",
                    )
                  }
                  type="button"
                  aria-label={text.density}
                  title={`${text.density}: ${density === "compact" ? text.compact : text.comfortable}`}
                >
                  {density === "compact" ? text.compact : text.comfortable}
                </button>
                <button
                  className="h-10 w-10 rounded-md border border-border/60 bg-background p-0"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  type="button"
                  aria-label={text.theme}
                >
                  {theme === "light" ? (
                    <IconMoon size={18} />
                  ) : (
                    <IconSun size={18} />
                  )}
                </button>
                <a
                  className="inline-flex h-10 items-center rounded-md border border-border/60 bg-background px-3 text-xs font-medium hover:bg-secondary"
                  href="https://buymeacoffee.com/fran11799"
                  rel="noreferrer"
                  target="_blank"
                  title={text.supportHint}
                >
                  {text.support}
                </a>
              </div>
            </div>

            <details className="rounded-md border border-border/60 bg-panel/35 px-3 py-2 text-sm">
              <summary className="cursor-pointer select-none font-medium">
                {text.privacyTitle}
              </summary>
              <p className="mt-2 text-foreground/80">{text.privacy}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/80">
                <li>{text.privacyItems.local}</li>
                <li>{text.privacyItems.upload}</li>
                <li>{text.privacyItems.tracking}</li>
                <li>{text.privacyItems.auth}</li>
              </ul>
            </details>
          </header>

          <section className="tool-shell rounded-lg border border-border/50 bg-background p-4 md:p-6">
            <SelectedToolComponent language={language} />
          </section>
          <footer className="mt-4 rounded-md border border-border/50 bg-panel/25 p-4 text-sm text-foreground/85">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-3">
                <p className="font-semibold">{text.footer.suggestTitle}</p>
                <a
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-border/60 bg-background px-3 text-xs font-semibold hover:bg-secondary"
                  href="#"
                >
                  <IconHeart size={15} />
                  {text.footer.suggestCta}
                </a>
                <p className="text-xs text-foreground/70">
                  {text.footer.brandLine}
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-semibold">{text.footer.tagsTitle}</p>
                <ul className="grid grid-cols-2 gap-2 text-xs text-foreground/80">
                  {text.footer.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <p className="font-semibold">{text.footer.supportTitle}</p>
                <a
                  className="inline-flex h-10 items-center rounded-md border border-border/60 bg-background px-3 text-xs font-semibold hover:bg-secondary"
                  href="https://buymeacoffee.com/fran11799"
                  rel="noreferrer"
                  target="_blank"
                >
                  {text.supportCta}
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

type SidebarProps = {
  language: Language;
  search: string;
  onSearchChange: (value: string) => void;
  selectedToolId: ToolId;
  toolsToRender: typeof tools;
  onSelectTool: (toolId: ToolId) => void;
};

function Sidebar({
  language,
  search,
  onSearchChange,
  onSelectTool,
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

  if (toolsToRender.length === 0) {
    return <p className="text-sm">{text.emptySearch}</p>;
  }

  return (
    <nav aria-label={text.toolsNavigation} className="space-y-4 px-3 py-5">
      <div className="relative px-1">
        <IconSearch
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sidebar-foreground/65"
          size={16}
        />
        <input
          aria-label={text.searchPlaceholder}
          className="h-10 w-full rounded-md border border-sidebar-foreground/20 bg-sidebar/40 py-2 pl-10 pr-3 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/55"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={text.searchPlaceholder}
          value={search}
        />
      </div>
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
          className={`pointer-events-none absolute left-2 h-1.5 w-1.5 rounded-full transition-transform duration-200 ease-out motion-reduce:transition-none ${styles.marker} ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ transform: `translateY(${markerY}px)` }}
        />
        {categoryTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.id === selectedToolId;
          return (
            <button
              aria-pressed={isActive}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-foreground ${isActive ? `${styles.active} bg-sidebar-foreground/14 font-semibold` : styles.inactive}`}
              data-tool-id={tool.id}
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              type="button"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" />
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
