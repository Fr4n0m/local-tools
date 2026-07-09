"use client";

import {
  IconArrowRight,
  IconCheck,
  IconGridDots,
  IconLayoutRows,
  IconLayoutDistributeVertical,
  IconLayoutDashboard,
  IconMenu2,
  IconMoon,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
  IconSun,
} from "@tabler/icons-react";
import Link from "next/link";

import { AppLogo } from "@/shared/presentation/components/app-logo";
import { LanguageSelector } from "@/shared/presentation/components/language-selector";
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
type ToolView = "grid" | "tool";

const SEARCH_SYNONYMS: Record<string, string[]> = {
  comprimir: ["compresor", "compresion", "compression", "compress", "reduce"],
  compresor: ["comprimir", "compresion", "compression", "compress", "reduce"],
  compresion: ["comprimir", "compresor", "compression", "compress", "reduce"],
  compression: ["compress", "compressor", "comprimir", "compresor"],
  compress: ["compression", "compressor", "comprimir", "compresor"],
  convertir: ["conversor", "conversion", "convert", "converter", "exportar"],
  conversor: ["convertir", "conversion", "convert", "converter", "export"],
  conversion: ["convertir", "conversor", "convert", "converter"],
  convert: ["converter", "conversion", "convertir", "conversor"],
  converter: ["convert", "conversion", "convertir", "conversor"],
  imagen: ["image", "photo", "foto", "png", "jpg", "jpeg", "webp", "heic"],
  image: ["imagen", "photo", "foto", "png", "jpg", "jpeg", "webp", "heic"],
  foto: ["photo", "image", "imagen", "jpg", "jpeg", "heic"],
  photo: ["foto", "image", "imagen", "jpg", "jpeg", "heic"],
  pdf: ["documento", "document", "paginas", "pages"],
  json: ["payload", "api", "format", "formato", "validar", "validate"],
  formato: ["format", "formatter", "formatear", "json"],
  formatear: ["format", "formatter", "formato", "json"],
  format: ["formatter", "formato", "formatear", "json"],
  validar: ["validate", "checker", "comprobar", "contraste", "contrast"],
  validate: ["validar", "checker", "check", "contrast", "contraste"],
  color: ["colores", "colors", "palette", "paleta", "contraste", "contrast"],
  colores: ["color", "colors", "palette", "paleta", "contraste"],
  colors: ["color", "colores", "palette", "paleta", "contrast"],
  texto: ["text", "transformar", "transform", "string"],
  text: ["texto", "transformar", "transform", "string"],
  qr: ["codigo", "code", "link", "url"],
  url: ["link", "encode", "decode", "codificar", "decodificar"],
  codificar: ["encode", "encoder", "base64", "url"],
  decodificar: ["decode", "decoder", "base64", "url"],
  encode: ["codificar", "encoder", "base64", "url"],
  decode: ["decodificar", "decoder", "base64", "url"],
};

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function expandSearchTerms(value: string): string[] {
  const normalized = normalizeSearchText(value);
  if (!normalized) {
    return [];
  }

  const terms = normalized.split(/\s+/);
  return Array.from(
    new Set(terms.flatMap((term) => [term, ...(SEARCH_SYNONYMS[term] ?? [])])),
  );
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

function readViewFromUrl(): ToolView {
  if (typeof window === "undefined") {
    return "tool";
  }

  const view = new URL(window.location.href).searchParams.get("view");
  return view === "grid" ? "grid" : "tool";
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

function getInitialView(): ToolView {
  if (typeof window === "undefined") {
    return "tool";
  }

  const fromUrl = readViewFromUrl();
  if (fromUrl === "grid") {
    return "grid";
  }

  return readToolFromUrl() ? "tool" : "grid";
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
  const mainRef = useRef<HTMLElement | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [view, setView] = useState<ToolView>("grid");
  const [selectedToolId, setSelectedToolId] = useState<ToolId>(tools[0].id);
  const [search, setSearch] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLanguage(resolveInitialLanguage());
      setTheme(readInitialTheme());
      setDensity(readInitialDensity());
      setView(getInitialView());
      setSelectedToolId(getInitialToolId());
      setIsReady(true);
    });

    const onThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      setTheme(nextTheme === "dark" ? "dark" : "light");
    };

    window.addEventListener("localtools:theme-change", onThemeChange);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("localtools:theme-change", onThemeChange);
    };
  }, []);

  function focusMainContent() {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      mainRef.current?.focus({ preventScroll: true });
    });
  }

  function selectTool(toolId: ToolId) {
    setSelectedToolId(toolId);
    setView("tool");
    focusMainContent();
  }

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("localtools.theme", theme);
    window.dispatchEvent(
      new CustomEvent("localtools:theme-change", { detail: theme }),
    );
    window.dispatchEvent(new CustomEvent("cmd-kit-theme-change"));
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
    const nextUrl = new URL(window.location.href);

    if (view === "grid") {
      nextUrl.searchParams.set("view", "grid");
      nextUrl.searchParams.delete("tool");
    } else {
      window.localStorage.setItem("localtools.tool", selectedToolId);
      nextUrl.searchParams.set("tool", selectedToolId);
      nextUrl.searchParams.delete("view");
    }

    window.history.replaceState({}, "", nextUrl);
  }, [selectedToolId, view, isReady]);

  useEffect(() => {
    const onPopState = () => {
      setView(readViewFromUrl());
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
    const searchTerms = expandSearchTerms(search);
    if (searchTerms.length === 0) {
      return tools;
    }

    return tools.filter((tool) => {
      const searchableText = normalizeSearchText(
        [
          tool.id,
          tool.category,
          tool.name.en,
          tool.name.es,
          tool.description.en,
          tool.description.es,
        ].join(" "),
      );

      return searchTerms.some((term) => searchableText.includes(term));
    });
  }, [search]);

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
      <div className="tools-page-shell flex min-h-screen md:gap-5 md:p-3">
        <aside className="hidden w-72 shrink-0 md:block">
          <div
            className={`tools-aside-panel relative overflow-hidden rounded-2xl bg-sidebar text-sidebar-foreground ${
              view === "grid"
                ? "min-h-[calc(100vh-1.5rem)]"
                : "h-[calc(100vh-1.5rem)]"
            }`}
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
              onLanguageSelect={(lang) => setLanguage(lang)}
              onSearchChange={setSearch}
              onSelectTool={selectTool}
              onShowGrid={() => setView("grid")}
              onThemeToggle={toggleTheme}
              selectedToolId={selectedToolId}
              view={view}
              toolsToRender={filteredTools}
              stretchToPage={view === "grid"}
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
              className="tools-aside-panel h-full w-72 bg-sidebar text-sidebar-foreground"
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
                onLanguageSelect={(lang) => setLanguage(lang)}
                onSearchChange={setSearch}
                onSelectTool={(toolId) => {
                  selectTool(toolId);
                  setIsMobileSidebarOpen(false);
                }}
                onShowGrid={() => {
                  setView("grid");
                  setIsMobileSidebarOpen(false);
                }}
                onThemeToggle={toggleTheme}
                selectedToolId={selectedToolId}
                view={view}
                toolsToRender={filteredTools}
                stretchToPage={false}
              />
            </aside>
          </div>
        ) : null}

        <main
          className={`flex-1 p-4 ${view === "grid" ? "md:p-4" : "md:p-0"}`}
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
        >
          <header className="mb-6 md:hidden">
            <button
              aria-controls="mobile-sidebar"
              aria-expanded={isMobileSidebarOpen}
              className="rounded-md bg-panel/40 p-2"
              onClick={() => setIsMobileSidebarOpen(true)}
              type="button"
              aria-label={text.menu}
            >
              <IconMenu2 size={18} />
            </button>
          </header>

          {view === "grid" ? (
            <ToolsIndex
              language={language}
              onSelectTool={selectTool}
              search={search}
              toolsToRender={filteredTools}
            />
          ) : (
            <section className="tool-shell tools-tool-panel rounded-2xl p-4 md:p-6">
              <div className="tools-tool-topbar">
                <PrivacyInfo text={text} />
              </div>
              <SelectedToolComponent language={language} />
            </section>
          )}
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
  onShowGrid: () => void;
  onThemeToggle: () => void;
  selectedToolId: ToolId;
  stretchToPage: boolean;
  view: ToolView;
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
  onShowGrid,
  onThemeToggle,
  selectedToolId,
  stretchToPage,
  view,
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
      className={`aside-fade-mask hide-scrollbar space-y-4 overflow-y-auto px-3 py-5 ${
        stretchToPage ? "min-h-[inherit]" : "h-full"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <Link className="inline-flex" href="/">
          <AppLogo className="text-sidebar-foreground" />
        </Link>
        <div className="flex items-center gap-0.5 rounded-lg bg-black p-0.5">
          <LanguageSelector
            label={text.language}
            language={language}
            onSelect={onLanguageSelect}
            variant="aside"
          />
          <button
            aria-label={text.density}
            className="aside-top-control flex h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/12 hover:text-sidebar-foreground"
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
            className="aside-top-control flex h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/12 hover:text-sidebar-foreground"
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
          className="aside-search h-8 w-full rounded-md bg-sidebar/40 py-1.5 pl-10 pr-3 text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/55"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={text.searchPlaceholder}
          value={search}
        />
      </div>
      {search.trim() ? null : (
        <div className="space-y-1.5 px-1">
          <Link
            className="aside-tool-btn aside-primary-btn group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-sidebar-foreground/88 hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-foreground"
            href="/"
          >
            <span aria-hidden className="tool-marker-dot h-1.5 w-1.5" />
            <span aria-hidden className="shrink-0">
              <IconLayoutDashboard size={15} />
            </span>
            <span className="font-medium">{text.homeNav}</span>
          </Link>
          <button
            aria-pressed={view === "grid"}
            className={`aside-tool-btn aside-primary-btn group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-foreground ${
              view === "grid"
                ? "font-semibold text-sidebar-foreground"
                : "text-sidebar-foreground/88 hover:text-sidebar-foreground focus-visible:text-sidebar-foreground"
            }`}
            onClick={onShowGrid}
            type="button"
          >
            <span aria-hidden className="tool-marker-dot h-1.5 w-1.5" />
            <span aria-hidden className="shrink-0">
              <IconGridDots size={15} />
            </span>
            <span className="font-medium">{text.toolsIndexNav}</span>
          </button>
        </div>
      )}
      {toolsToRender.length === 0 ? (
        <div className="aside-empty-state">
          <span className="aside-empty-icon" aria-hidden>
            <IconSparkles size={16} />
          </span>
          <p>{text.emptySearchTitle}</p>
          <span>{text.emptySearchText}</span>
          <a
            className="aside-empty-link"
            href={text.footer.reportUrl}
            rel="noreferrer"
            target="_blank"
          >
            {text.emptySearchCta}
          </a>
        </div>
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
    </nav>
  );
}

type PrivacyInfoProps = {
  text: (typeof sharedMessages)[Language];
};

function PrivacyInfo({ text }: PrivacyInfoProps) {
  return (
    <div className="tools-privacy-popover">
      <button
        aria-label={text.privacyTitle}
        className="tools-privacy-trigger"
        type="button"
      >
        <IconShieldCheck aria-hidden size={15} />
      </button>
      <div className="tools-privacy-card" role="tooltip">
        <p>{text.privacy}</p>
        <ul>
          {Object.values(text.privacyItems).map((item) => (
            <li key={item}>
              <IconCheck aria-hidden size={13} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
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

type ToolsIndexProps = {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
  search: string;
  toolsToRender: typeof tools;
};

function ToolsIndex({
  language,
  onSelectTool,
  search,
  toolsToRender,
}: ToolsIndexProps) {
  const text = sharedMessages[language];
  const categoryCount = new Set(tools.map((tool) => tool.category)).size;
  const isSearching = search.trim().length > 0;
  const groupedTools = isSearching
    ? []
    : (
        Object.entries(text.categories) as Array<
          [keyof typeof text.categories, string]
        >
      )
        .map(([category, label]) => ({
          category,
          label,
          tools: toolsToRender.filter((tool) => tool.category === category),
        }))
        .filter((group) => group.tools.length > 0);

  return (
    <section className="tools-index-panel">
      <div className="tools-index-hero">
        <div>
          <p className="tools-index-eyebrow">{text.toolsIndexEyebrow}</p>
          <h1 className="tools-index-title">{text.toolsIndexTitle}</h1>
          <p className="tools-index-subtitle">{text.toolsIndexSubtitle}</p>
        </div>
        <dl
          className="tools-index-stats"
          aria-label={text.toolsIndexStatsLabel}
        >
          <div>
            <dt>{text.toolsIndexStatTools}</dt>
            <dd>{tools.length}</dd>
          </div>
          <div>
            <dt>{text.toolsIndexStatCategories}</dt>
            <dd>{categoryCount}</dd>
          </div>
        </dl>
      </div>

      {isSearching ? (
        <p className="tools-index-search-note">
          {text.toolsIndexSearchHint.replace(
            "{count}",
            String(toolsToRender.length),
          )}
        </p>
      ) : null}

      {toolsToRender.length === 0 ? (
        <div className="tools-index-empty">
          <p>{text.toolsIndexEmptyTitle}</p>
          <span>{text.toolsIndexEmptyText}</span>
        </div>
      ) : isSearching ? (
        <div className="tools-index-grid">
          {toolsToRender.map((tool) => (
            <ToolIndexCard
              key={tool.id}
              language={language}
              onSelectTool={onSelectTool}
              showCategory
              text={text}
              tool={tool}
            />
          ))}
        </div>
      ) : (
        <div className="tools-index-groups">
          {groupedTools.map((group) => (
            <section className="tools-index-group" key={group.category}>
              <div className="tools-index-group-heading">
                <h2>{group.label}</h2>
                <span>{group.tools.length}</span>
              </div>
              <div className="tools-index-grid">
                {group.tools.map((tool) => (
                  <ToolIndexCard
                    key={tool.id}
                    language={language}
                    onSelectTool={onSelectTool}
                    showCategory={false}
                    text={text}
                    tool={tool}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

type ToolIndexCardProps = {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
  showCategory?: boolean;
  text: (typeof sharedMessages)[Language];
  tool: (typeof tools)[number];
};

function ToolIndexCard({
  language,
  onSelectTool,
  showCategory = true,
  text,
  tool,
}: ToolIndexCardProps) {
  const Icon = tool.icon;
  const categoryLabel =
    text.categories[tool.category as keyof typeof text.categories];

  return (
    <button
      className="tools-index-card"
      onClick={() => onSelectTool(tool.id)}
      type="button"
    >
      <span className="tools-index-card-top">
        <span className="tools-index-card-icon" aria-hidden>
          <Icon size={20} />
        </span>
        <span className="tools-index-card-copy">
          {showCategory ? (
            <span className="tools-index-card-category">{categoryLabel}</span>
          ) : null}
          <span className="tools-index-card-title">{tool.name[language]}</span>
          <span className="tools-index-card-description">
            {tool.description[language]}
          </span>
        </span>
      </span>
      <span className="tools-index-card-action">
        {text.toolsIndexOpenLabel}
        <IconArrowRight aria-hidden size={15} />
      </span>
    </button>
  );
}
