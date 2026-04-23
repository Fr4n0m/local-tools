"use client";

import { IconMenu2, IconMoon, IconSearch, IconSun } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import { tools } from "@/modules/tool-registry/application/tools";
import type { ToolId } from "@/modules/tool-registry/domain/tool";
import { Card } from "@/shared/presentation/components/ui/card";
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

export function ToolboxApp() {
  const [language, setLanguage] = useState<Language>(() =>
    typeof window === "undefined" ? "en" : resolveInitialLanguage(),
  );
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? "light" : readInitialTheme(),
  );
  const [selectedToolId, setSelectedToolId] = useState<ToolId>(() =>
    typeof window === "undefined" ? tools[0].id : getInitialToolId(),
  );
  const [search, setSearch] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("localtools.theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("localtools.language", language);
  }, [language]);

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 border-r border-border bg-secondary/20 p-4 md:block">
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
          >
            <aside
              className="h-full w-80 border-r border-border bg-background p-4"
              onClick={(event) => event.stopPropagation()}
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

        <main className="flex-1 p-4 md:p-6">
          <header className="mb-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  className="rounded-md border p-2 md:hidden"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  type="button"
                  aria-label={text.menu}
                >
                  <IconMenu2 size={18} />
                </button>
                <h1 className="text-2xl font-bold">{text.appTitle}</h1>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
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
                  className="rounded-md border p-2"
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
                className="w-full rounded-md border bg-background/60 py-3 pl-10 pr-4"
                placeholder={text.searchPlaceholder}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <Card className="p-3 text-sm">{text.privacy}</Card>
          </header>

          <section className="rounded-xl border border-border bg-secondary/10 p-4 md:p-6">
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
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, categoryTools]) => (
        <div className="space-y-2" key={category}>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
            {text.categories[category as keyof typeof text.categories]}
          </p>
          <div className="space-y-2">
            {categoryTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = tool.id === selectedToolId;
              return (
                <button
                  className={`w-full rounded-md border p-3 text-left text-sm transition ${
                    isActive ? "bg-primary text-background" : "bg-background/30"
                  }`}
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  type="button"
                >
                  <div className="mb-1 flex items-center gap-2 font-medium">
                    <Icon size={16} />
                    {tool.name[language]}
                  </div>
                  <p className="text-xs opacity-90">
                    {tool.description[language]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
