"use client";

import {
  CommandPalette,
  type CommandItem,
  type CommandSection,
  type CommandTheme,
} from "@cmd-kit/react";
import {
  IconBellRinging,
  IconBrandGithub,
  IconBulb,
  IconCommand,
  IconFileDescription,
  IconGridDots,
  IconHome,
  IconLanguage,
  IconMoon,
  IconShieldLock,
  IconSun,
  type Icon,
} from "@tabler/icons-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { tools } from "@/modules/tool-registry/application/tools";
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

const paletteTheme: Record<Theme, CommandTheme> = {
  light: {
    accentColor: "#495057",
    backgroundColor: "#f8f9fa",
    textColor: "#212529",
    titleColor: "#212529",
    descriptionColor: "#6c757d",
    mutedColor: "#6c757d",
    sectionTitleColor: "rgba(33, 37, 41, 0.58)",
    itemTitleColor: "#212529",
    itemSubtitleColor: "#6c757d",
    shortcutColor: "#6c757d",
    borderColor: "rgba(33, 37, 41, 0.16)",
    overlayColor: "rgba(248, 249, 250, 0.72)",
    radius: "22px",
    shadow:
      "5px 5px 0 rgba(33, 37, 41, 0.18), 0 20px 48px rgba(33, 37, 41, 0.14)",
  },
  dark: {
    accentColor: "#ced4da",
    backgroundColor: "#000000",
    textColor: "#f8f9fa",
    titleColor: "#f8f9fa",
    descriptionColor: "#adb5bd",
    mutedColor: "#adb5bd",
    sectionTitleColor: "rgba(248, 249, 250, 0.62)",
    itemTitleColor: "#f8f9fa",
    itemSubtitleColor: "#adb5bd",
    shortcutColor: "#adb5bd",
    borderColor: "rgba(248, 249, 250, 0.18)",
    overlayColor: "rgba(0, 0, 0, 0.72)",
    radius: "22px",
    shadow:
      "5px 5px 0 rgba(248, 249, 250, 0.14), 0 22px 54px rgba(0, 0, 0, 0.46)",
  },
};

function setStoredLanguage(language: Language) {
  document.documentElement.lang = language;
  window.localStorage.setItem("localtools.language", language);
  window.dispatchEvent(
    new CustomEvent("localtools:language-change", { detail: language }),
  );
}

function buildSections(
  language: Language,
  setLanguage: (language: Language) => void,
  setTheme: Dispatch<SetStateAction<Theme>>,
  currentTheme: Theme,
): CommandSection[] {
  const text = sharedMessages[language];
  const isEs = language === "es";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  const categories = Object.entries(text.categories) as Array<
    [keyof typeof text.categories, string]
  >;
  const languageOptions: Array<{
    id: string;
    title: string;
    subtitle: string;
    language?: Language;
    disabled?: boolean;
    keywords: string[];
  }> = [
    {
      id: "language-es",
      title: isEs ? "Español" : "Spanish",
      subtitle:
        language === "es"
          ? isEs
            ? "Idioma actual"
            : "Current language"
          : isEs
            ? "Cambiar interfaz a español"
            : "Switch interface to Spanish",
      language: "es",
      keywords: ["spanish", "español", "es", "idioma", "language"],
    },
    {
      id: "language-en",
      title: isEs ? "Inglés" : "English",
      subtitle:
        language === "en"
          ? isEs
            ? "Idioma actual"
            : "Current language"
          : isEs
            ? "Cambiar interfaz a inglés"
            : "Switch interface to English",
      language: "en",
      keywords: ["english", "ingles", "en", "idioma", "language"],
    },
    {
      id: "language-fr",
      title: isEs ? "Francés" : "French",
      subtitle: isEs ? "Pendiente de traducción" : "Translation pending",
      disabled: true,
      keywords: ["french", "frances", "fr", "idioma", "language"],
    },
    {
      id: "language-de",
      title: isEs ? "Alemán" : "German",
      subtitle: isEs ? "Pendiente de traducción" : "Translation pending",
      disabled: true,
      keywords: ["german", "aleman", "de", "idioma", "language"],
    },
    {
      id: "language-it",
      title: isEs ? "Italiano" : "Italian",
      subtitle: isEs ? "Pendiente de traducción" : "Translation pending",
      disabled: true,
      keywords: ["italian", "italiano", "it", "idioma", "language"],
    },
  ];

  return [
    {
      id: "navigation",
      title: isEs ? "Navegación" : "Navigation",
      items: [
        {
          id: "home",
          title: text.homeNav,
          subtitle: isEs ? "Volver a la home" : "Go back to the home page",
          href: "/",
          shortcut: "mod+1",
          keywords: ["home", "inicio", "landing"],
        },
        {
          id: "tools-index",
          title: text.toolsIndexNav,
          subtitle: isEs
            ? "Abrir el grid completo de herramientas"
            : "Open the full tools grid",
          href: "/tools?view=grid",
          shortcut: "mod+2",
          keywords: ["tools", "grid", "toolbox", "herramientas"],
        },
        {
          id: "subscribe",
          title: isEs ? "Suscribirse a novedades" : "Subscribe for updates",
          subtitle: isEs
            ? "Recibir avisos de nuevas tools y mejoras"
            : "Get notices for new tools and improvements",
          href: "/#subscribe-updates",
          keywords: ["updates", "newsletter", "subscribe", "suscripcion"],
        },
      ],
    },
    {
      id: "tools",
      title: isEs ? "Tools" : "Tools",
      items: tools.map((tool) => ({
        id: `tool-${tool.id}`,
        title: tool.name[language],
        subtitle: tool.description[language],
        href: `/tools?tool=${tool.id}`,
        keywords: [
          tool.id,
          tool.category,
          tool.name.en,
          tool.name.es,
          tool.description.en,
          tool.description.es,
        ],
      })),
    },
    {
      id: "categories",
      title: isEs ? "Categorías" : "Categories",
      items: categories.map(([category, title]) => ({
        id: `category-${category}`,
        title,
        subtitle: isEs
          ? "Ver tools de esta categoría"
          : "View tools in this category",
        children: [
          {
            id: `category-${category}-tools`,
            title,
            items: tools
              .filter((tool) => tool.category === category)
              .map((tool) => ({
                id: `category-${category}-${tool.id}`,
                title: tool.name[language],
                subtitle: tool.description[language],
                href: `/tools?tool=${tool.id}`,
                keywords: [
                  tool.id,
                  tool.category,
                  title,
                  tool.name.en,
                  tool.name.es,
                  tool.description.en,
                  tool.description.es,
                ],
              })),
          },
        ],
        keywords: ["category", "categoria", category, title],
      })),
    },
    {
      id: "system",
      title: isEs ? "Sistema" : "System",
      items: [
        {
          id: "language",
          title: isEs ? "Idioma" : "Language",
          subtitle: isEs
            ? "Elegir idioma de la interfaz"
            : "Choose interface language",
          children: [
            {
              id: "language-options",
              title: isEs ? "Idiomas" : "Languages",
              items: languageOptions.map((option) => {
                const optionLanguage = option.language;

                return {
                  id: option.id,
                  title: option.title,
                  subtitle: option.subtitle,
                  disabled: option.disabled,
                  keywords: option.keywords,
                  onSelect: optionLanguage
                    ? () => {
                        setStoredLanguage(optionLanguage);
                        setLanguage(optionLanguage);
                      }
                    : undefined,
                };
              }),
            },
          ],
          shortcut: "mod+shift+l",
          keywords: [
            "language",
            "idioma",
            "english",
            "spanish",
            "french",
            "german",
            "italian",
            "es",
            "en",
            "fr",
            "de",
            "it",
          ],
        },
        {
          id: "switch-theme",
          title: isEs
            ? nextTheme === "dark"
              ? "Cambiar a modo oscuro"
              : "Cambiar a modo claro"
            : nextTheme === "dark"
              ? "Switch to dark mode"
              : "Switch to light mode",
          subtitle: isEs
            ? "Alternar tema de LocalTools"
            : "Toggle the LocalTools theme",
          onSelect: () => setThemeWithTransition(setTheme, nextTheme),
          shortcut: "mod+shift+t",
          keywords: ["theme", "tema", "dark", "light", "oscuro", "claro"],
        },
      ],
    },
    {
      id: "project",
      title: isEs ? "Proyecto" : "Project",
      items: [
        {
          id: "github",
          title: isEs ? "Ver en GitHub" : "Open GitHub",
          subtitle: isEs
            ? "Abrir el repositorio de LocalTools"
            : "Open the LocalTools repository",
          href: text.footer.suggestUrl,
          keywords: ["github", "repo", "repositorio", "source", "open source"],
        },
        {
          id: "suggest",
          title: isEs ? "Enviar sugerencia" : "Send suggestion",
          subtitle: isEs
            ? "Abrir un issue con una idea o caso real"
            : "Open an issue with an idea or real use case",
          href: text.footer.reportUrl,
          keywords: ["issue", "suggest", "sugerencia", "feedback", "bug"],
        },
        {
          id: "privacy",
          title: isEs ? "Privacidad" : "Privacy",
          subtitle: isEs
            ? "Leer la política de privacidad"
            : "Read the privacy policy",
          href: "/privacy",
          keywords: ["privacy", "privacidad", "data", "datos"],
        },
        {
          id: "terms",
          title: isEs ? "Términos" : "Terms",
          subtitle: isEs ? "Leer los términos de uso" : "Read the terms of use",
          href: "/terms",
          keywords: ["terms", "terminos", "legal"],
        },
      ],
    },
  ];
}

type PaletteIcon = Icon;

function buildIconMap(theme: Theme): Record<string, PaletteIcon> {
  const toolIcons = Object.fromEntries(
    tools.map((tool) => [`tool-${tool.id}`, tool.icon]),
  ) as Record<string, PaletteIcon>;
  const categoryToolIcons = Object.fromEntries(
    tools.flatMap((tool) => [
      [`category-${tool.category}-${tool.id}`, tool.icon],
      [`category-${tool.category}`, IconGridDots],
      [`category-${tool.category}-tools`, IconGridDots],
    ]),
  ) as Record<string, PaletteIcon>;

  return {
    ...toolIcons,
    ...categoryToolIcons,
    home: IconHome,
    "tools-index": IconGridDots,
    subscribe: IconBellRinging,
    github: IconBrandGithub,
    suggest: IconBulb,
    language: IconLanguage,
    "language-options": IconLanguage,
    "language-es": IconLanguage,
    "language-en": IconLanguage,
    "language-fr": IconLanguage,
    "language-de": IconLanguage,
    "language-it": IconLanguage,
    "switch-theme": theme === "dark" ? IconSun : IconMoon,
    privacy: IconShieldLock,
    terms: IconFileDescription,
  };
}

function renderShortcut(shortcut: string) {
  return shortcut
    .split("+")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .map((token) => {
      if (token === "mod") {
        return (
          <IconCommand
            aria-label="Command"
            key={token}
            size={13}
            stroke={2.55}
          />
        );
      }

      if (token === "shift") {
        return <span key={token}>⇧</span>;
      }

      if (token === "ctrl" || token === "control") {
        return <span key={token}>Ctrl</span>;
      }

      return <span key={token}>{token.toUpperCase()}</span>;
    });
}

function renderPaletteItem(
  item: CommandItem,
  active: boolean,
  icons: Record<string, PaletteIcon>,
) {
  const ItemIcon = icons[item.id] ?? IconGridDots;

  return (
    <div
      className={`lt-command-row${active ? " is-active" : ""}${item.disabled ? " is-disabled" : ""}`}
    >
      <span className="lt-command-row__icon" aria-hidden="true">
        <ItemIcon size={21} stroke={2.35} />
      </span>
      <span className="lt-command-row__copy">
        <strong>{item.title}</strong>
        {item.subtitle ? <span>{item.subtitle}</span> : null}
      </span>
      {item.shortcut ? (
        <kbd className="lt-command-row__shortcut">
          {renderShortcut(item.shortcut)}
        </kbd>
      ) : null}
    </div>
  );
}

export function GlobalCommandPalette() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [open, setOpen] = useState(false);
  const isReadyRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLanguage(resolveInitialLanguage());
      setTheme(readInitialTheme());
      isReadyRef.current = true;
    });

    const onLanguageChange = () => setLanguage(resolveInitialLanguage());
    const onOpen = () => setOpen(true);
    const onThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      setTheme(nextTheme === "dark" ? "dark" : "light");
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "localtools.language") {
        setLanguage(resolveInitialLanguage());
      }

      if (event.key === "localtools.theme") {
        setTheme(readInitialTheme());
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("localtools:language-change", onLanguageChange);
    window.addEventListener("localtools:theme-change", onThemeChange);
    window.addEventListener("localtools:command-palette-open", onOpen);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "localtools:language-change",
        onLanguageChange,
      );
      window.removeEventListener("localtools:theme-change", onThemeChange);
      window.removeEventListener("localtools:command-palette-open", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!isReadyRef.current) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("localtools.theme", theme);
    window.dispatchEvent(
      new CustomEvent("localtools:theme-change", { detail: theme }),
    );
    window.dispatchEvent(new CustomEvent("cmd-kit-theme-change"));
  }, [theme]);

  const sections = useMemo(
    () => buildSections(language, setLanguage, setTheme, theme),
    [language, theme],
  );
  const iconMap = useMemo(() => buildIconMap(theme), [theme]);
  const resolvedPaletteTheme = useMemo(() => paletteTheme[theme], [theme]);

  const title =
    language === "es" ? "Comandos de LocalTools" : "LocalTools commands";

  return (
    <>
      <button
        aria-label={language === "es" ? "Abrir comandos" : "Open commands"}
        className="lt-command-floating-trigger"
        onClick={() => setOpen(true)}
        title={`${title} (Ctrl/Cmd + K)`}
        type="button"
      >
        <span className="lt-command-shortcut-hint" aria-hidden="true">
          <IconCommand aria-hidden size={11} stroke={2.55} />
          <span>+</span>
          <span>K</span>
        </span>
      </button>
      <CommandPalette
        messages={{
          noResults:
            language === "es"
              ? "No hay comandos para esa búsqueda."
              : "No commands match that search.",
          searchPlaceholder:
            language === "es"
              ? "Busca tools, acciones o páginas..."
              : "Search tools, actions, or pages...",
        }}
        recents={{
          limit: 8,
          sectionTitle: language === "es" ? "Recientes" : "Recent",
        }}
        open={open}
        onOpenChange={setOpen}
        renderItem={(item, active) => renderPaletteItem(item, active, iconMap)}
        sections={sections}
        shortcut="mod+k"
        size="normal"
        theme={resolvedPaletteTheme}
        title={title}
      />
    </>
  );
}
