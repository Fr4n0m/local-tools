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
  LANGUAGE_OPTIONS,
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
    shadow: "var(--surface-shadow)",
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
    shadow: "var(--surface-shadow-dark)",
  },
};

const paletteCopy: Record<
  Language,
  {
    navigation: string;
    homeSubtitle: string;
    toolsSubtitle: string;
    subscribe: string;
    subscribeSubtitle: string;
    tools: string;
    categories: string;
    categorySubtitle: string;
    system: string;
    language: string;
    languageSubtitle: string;
    languages: string;
    switchDark: string;
    switchLight: string;
    themeSubtitle: string;
    project: string;
    github: string;
    githubSubtitle: string;
    suggest: string;
    suggestSubtitle: string;
    privacy: string;
    privacySubtitle: string;
    terms: string;
    termsSubtitle: string;
    dialogLabel: string;
    triggerTitle: string;
    empty: string;
    placeholder: string;
    recent: string;
  }
> = {
  en: {
    navigation: "Navigation",
    homeSubtitle: "Go back to the home page",
    toolsSubtitle: "Open the full tools grid",
    subscribe: "Subscribe for updates",
    subscribeSubtitle: "Get notices for new tools and improvements",
    tools: "Tools",
    categories: "Categories",
    categorySubtitle: "View tools in this category",
    system: "System",
    language: "Language",
    languageSubtitle: "Choose interface language",
    languages: "Languages",
    switchDark: "Switch to dark mode",
    switchLight: "Switch to light mode",
    themeSubtitle: "Toggle the LocalTools theme",
    project: "Project",
    github: "Open GitHub",
    githubSubtitle: "Open the LocalTools repository",
    suggest: "Send suggestion",
    suggestSubtitle: "Open an issue with an idea or real use case",
    privacy: "Privacy",
    privacySubtitle: "Read the privacy policy",
    terms: "Terms",
    termsSubtitle: "Read the terms of use",
    dialogLabel: "LocalTools commands",
    triggerTitle: "+ K Open commands",
    empty: "No commands match that search.",
    placeholder: "Search tools, actions, or pages...",
    recent: "Recent",
  },
  es: {
    navigation: "Navegación",
    homeSubtitle: "Volver a la página de inicio",
    toolsSubtitle: "Abrir el grid completo de herramientas",
    subscribe: "Suscribirse a novedades",
    subscribeSubtitle: "Recibir avisos de nuevas herramientas y mejoras",
    tools: "Herramientas",
    categories: "Categorías",
    categorySubtitle: "Ver herramientas de esta categoría",
    system: "Sistema",
    language: "Idioma",
    languageSubtitle: "Elegir idioma de la interfaz",
    languages: "Idiomas",
    switchDark: "Cambiar a modo oscuro",
    switchLight: "Cambiar a modo claro",
    themeSubtitle: "Alternar el tema de LocalTools",
    project: "Proyecto",
    github: "Ver en GitHub",
    githubSubtitle: "Abrir el repositorio de LocalTools",
    suggest: "Enviar sugerencia",
    suggestSubtitle: "Abrir una incidencia con una idea o caso real",
    privacy: "Privacidad",
    privacySubtitle: "Leer la política de privacidad",
    terms: "Términos",
    termsSubtitle: "Leer los términos de uso",
    dialogLabel: "Comandos de LocalTools",
    triggerTitle: "+ K Abrir comandos",
    empty: "No hay comandos para esa búsqueda.",
    placeholder: "Buscar herramientas, acciones o páginas...",
    recent: "Recientes",
  },
  fr: {
    navigation: "Navigation",
    homeSubtitle: "Retourner à la page d’accueil",
    toolsSubtitle: "Ouvrir la grille complète des outils",
    subscribe: "S’abonner aux actualités",
    subscribeSubtitle: "Recevoir les nouveautés et améliorations",
    tools: "Outils",
    categories: "Catégories",
    categorySubtitle: "Voir les outils de cette catégorie",
    system: "Système",
    language: "Langue",
    languageSubtitle: "Choisir la langue de l’interface",
    languages: "Langues",
    switchDark: "Passer en mode sombre",
    switchLight: "Passer en mode clair",
    themeSubtitle: "Changer le thème de LocalTools",
    project: "Projet",
    github: "Ouvrir GitHub",
    githubSubtitle: "Ouvrir le dépôt LocalTools",
    suggest: "Envoyer une suggestion",
    suggestSubtitle: "Ouvrir un ticket avec une idée ou un cas concret",
    privacy: "Confidentialité",
    privacySubtitle: "Lire la politique de confidentialité",
    terms: "Conditions",
    termsSubtitle: "Lire les conditions d’utilisation",
    dialogLabel: "Commandes LocalTools",
    triggerTitle: "+ K Ouvrir les commandes",
    empty: "Aucune commande ne correspond à cette recherche.",
    placeholder: "Rechercher des outils, actions ou pages...",
    recent: "Récents",
  },
  de: {
    navigation: "Navigation",
    homeSubtitle: "Zur Startseite zurückkehren",
    toolsSubtitle: "Das vollständige Tool-Raster öffnen",
    subscribe: "Neuigkeiten abonnieren",
    subscribeSubtitle: "Hinweise zu neuen Tools und Verbesserungen erhalten",
    tools: "Tools",
    categories: "Kategorien",
    categorySubtitle: "Tools dieser Kategorie anzeigen",
    system: "System",
    language: "Sprache",
    languageSubtitle: "Sprache der Benutzeroberfläche auswählen",
    languages: "Sprachen",
    switchDark: "Zum dunklen Modus wechseln",
    switchLight: "Zum hellen Modus wechseln",
    themeSubtitle: "Das LocalTools-Design wechseln",
    project: "Projekt",
    github: "GitHub öffnen",
    githubSubtitle: "Das LocalTools-Repository öffnen",
    suggest: "Vorschlag senden",
    suggestSubtitle:
      "Ein Issue mit einer Idee oder einem Anwendungsfall öffnen",
    privacy: "Datenschutz",
    privacySubtitle: "Datenschutzerklärung lesen",
    terms: "Nutzungsbedingungen",
    termsSubtitle: "Nutzungsbedingungen lesen",
    dialogLabel: "LocalTools-Befehle",
    triggerTitle: "+ K Befehle öffnen",
    empty: "Keine Befehle entsprechen dieser Suche.",
    placeholder: "Tools, Aktionen oder Seiten suchen...",
    recent: "Zuletzt verwendet",
  },
  it: {
    navigation: "Navigazione",
    homeSubtitle: "Torna alla pagina iniziale",
    toolsSubtitle: "Apri la griglia completa degli strumenti",
    subscribe: "Iscriviti agli aggiornamenti",
    subscribeSubtitle: "Ricevi avvisi su nuovi strumenti e miglioramenti",
    tools: "Strumenti",
    categories: "Categorie",
    categorySubtitle: "Visualizza gli strumenti di questa categoria",
    system: "Sistema",
    language: "Lingua",
    languageSubtitle: "Scegli la lingua dell’interfaccia",
    languages: "Lingue",
    switchDark: "Passa alla modalità scura",
    switchLight: "Passa alla modalità chiara",
    themeSubtitle: "Cambia il tema di LocalTools",
    project: "Progetto",
    github: "Apri GitHub",
    githubSubtitle: "Apri il repository di LocalTools",
    suggest: "Invia suggerimento",
    suggestSubtitle: "Apri una segnalazione con un’idea o un caso reale",
    privacy: "Privacy",
    privacySubtitle: "Leggi l’informativa sulla privacy",
    terms: "Termini",
    termsSubtitle: "Leggi i termini di utilizzo",
    dialogLabel: "Comandi di LocalTools",
    triggerTitle: "+ K Apri comandi",
    empty: "Nessun comando corrisponde alla ricerca.",
    placeholder: "Cerca strumenti, azioni o pagine...",
    recent: "Recenti",
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
  const copy = paletteCopy[language];
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  const categories = Object.entries(text.categories) as Array<
    [keyof typeof text.categories, string]
  >;
  const languageNames: Record<Language, Record<Language, string>> = {
    en: {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
    },
    es: {
      en: "Inglés",
      es: "Español",
      fr: "Francés",
      de: "Alemán",
      it: "Italiano",
    },
    fr: {
      en: "Anglais",
      es: "Espagnol",
      fr: "Français",
      de: "Allemand",
      it: "Italien",
    },
    de: {
      en: "Englisch",
      es: "Spanisch",
      fr: "Französisch",
      de: "Deutsch",
      it: "Italienisch",
    },
    it: {
      en: "Inglese",
      es: "Spagnolo",
      fr: "Francese",
      de: "Tedesco",
      it: "Italiano",
    },
  };
  const currentLanguageLabel: Record<Language, string> = {
    en: "Current language",
    es: "Idioma actual",
    fr: "Langue actuelle",
    de: "Aktuelle Sprache",
    it: "Lingua attuale",
  };
  const switchLanguageLabel: Record<Language, string> = {
    en: "Switch interface language",
    es: "Cambiar idioma de la interfaz",
    fr: "Changer la langue de l’interface",
    de: "Sprache der Benutzeroberfläche ändern",
    it: "Cambia la lingua dell’interfaccia",
  };
  const languageOptions: Array<{
    id: string;
    title: string;
    subtitle: string;
    language?: Language;
    disabled?: boolean;
    keywords: string[];
  }> = LANGUAGE_OPTIONS.map((option) => ({
    id: `language-${option.code}`,
    title: languageNames[language][option.code],
    subtitle:
      language === option.code
        ? currentLanguageLabel[language]
        : switchLanguageLabel[language],
    language: option.code,
    keywords: [option.code, option.label, "idioma", "language"],
  }));

  return [
    {
      id: "navigation",
      title: copy.navigation,
      items: [
        {
          id: "home",
          title: text.homeNav,
          subtitle: copy.homeSubtitle,
          href: "/",
          shortcut: "mod+1",
          keywords: ["home", "inicio", "landing"],
        },
        {
          id: "tools-index",
          title: text.toolsIndexNav,
          subtitle: copy.toolsSubtitle,
          href: "/tools?view=grid",
          shortcut: "mod+2",
          keywords: ["tools", "grid", "toolbox", "herramientas"],
        },
        {
          id: "subscribe",
          title: copy.subscribe,
          subtitle: copy.subscribeSubtitle,
          href: "/#subscribe-updates",
          keywords: ["updates", "newsletter", "subscribe", "suscripcion"],
        },
      ],
    },
    {
      id: "tools",
      title: copy.tools,
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
      title: copy.categories,
      items: categories.map(([category, title]) => ({
        id: `category-${category}`,
        title,
        subtitle: copy.categorySubtitle,
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
      title: copy.system,
      items: [
        {
          id: "language",
          title: copy.language,
          subtitle: copy.languageSubtitle,
          children: [
            {
              id: "language-options",
              title: copy.languages,
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
          title: nextTheme === "dark" ? copy.switchDark : copy.switchLight,
          subtitle: copy.themeSubtitle,
          onSelect: () => setThemeWithTransition(setTheme, nextTheme),
          shortcut: "mod+shift+t",
          keywords: ["theme", "tema", "dark", "light", "oscuro", "claro"],
        },
      ],
    },
    {
      id: "project",
      title: copy.project,
      items: [
        {
          id: "github",
          title: copy.github,
          subtitle: copy.githubSubtitle,
          href: text.footer.suggestUrl,
          keywords: ["github", "repo", "repositorio", "source", "open source"],
        },
        {
          id: "suggest",
          title: copy.suggest,
          subtitle: copy.suggestSubtitle,
          href: text.footer.reportUrl,
          keywords: ["issue", "suggest", "sugerencia", "feedback", "bug"],
        },
        {
          id: "privacy",
          title: copy.privacy,
          subtitle: copy.privacySubtitle,
          href: "/privacy",
          keywords: ["privacy", "privacidad", "data", "datos"],
        },
        {
          id: "terms",
          title: copy.terms,
          subtitle: copy.termsSubtitle,
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

function ShortcutDisplay({ shortcut }: { shortcut: string }) {
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
          <ShortcutDisplay shortcut={item.shortcut} />
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
  const copy = paletteCopy[language];

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

  const title = copy.dialogLabel;

  return (
    <>
      <button
        aria-label={copy.triggerTitle}
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
        classNames={{
          closeButton: "lt-command-close",
          dialog: "lt-command-dialog",
          input: "lt-command-input",
          item: "lt-command-item",
          list: "lt-command-list",
        }}
        messages={{
          noResults: copy.empty,
          searchPlaceholder: copy.placeholder,
        }}
        recents={{
          limit: 8,
          sectionTitle: copy.recent,
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
