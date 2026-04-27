"use client";

import { IconMenu2, IconMoon, IconSearch, IconSun } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

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
                <select
                  className="rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as Language)
                  }
                  aria-label={text.language}
                >
                  <option value="en">EN</option>
                  <option value="es">ES</option>
                </select>
                <button
                  className="rounded-md border border-border/60 bg-background px-3 py-2 text-xs font-medium"
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
                  className="rounded-md border border-border/60 bg-background p-2"
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
              </div>
            </div>

            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 -translate-y-1/2"
                size={17}
              />
              <input
                aria-label={text.searchPlaceholder}
                className="w-full rounded-md border border-border/60 bg-background py-2.5 pl-10 pr-4"
                placeholder={text.searchPlaceholder}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
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
        </main>
      </div>
    </div>
  );
}

type SidebarProps = {
  language: Language;
  selectedToolId: ToolId;
  toolsToRender: typeof tools;
  onSelectTool: (toolId: ToolId) => void;
};

function Sidebar({
  language,
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
    <nav aria-label={text.toolsNavigation} className="space-y-6 px-3 py-5">
      {Object.entries(grouped).map(([category, categoryTools]) => (
        <div className="space-y-2" key={category}>
          <p
            className={`px-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${getCategoryStyles(category).heading}`}
          >
            {text.categories[category as keyof typeof text.categories]}
          </p>
          <div className="space-y-0.5">
            {categoryTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = tool.id === selectedToolId;
              const styles = getCategoryStyles(tool.category);
              return (
                <button
                  aria-pressed={isActive}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-foreground ${isActive ? styles.active : styles.inactive}`}
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  type="button"
                >
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-full ${isActive ? styles.marker : "bg-transparent"}`}
                  />
                  <span aria-hidden className="shrink-0">
                    <Icon size={15} />
                  </span>
                  <span className="font-medium">{tool.name[language]}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
