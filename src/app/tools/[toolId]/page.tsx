import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { tools } from "@/modules/tool-registry/application/tools";
import {
  isToolAvailable,
  type ToolId,
} from "@/modules/tool-registry/domain/tool";
import { ToolboxApp } from "@/shared/presentation/components/toolbox-app";
import type { Language } from "@/shared/presentation/i18n";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtools.app";
const faviconPath = "/tools/favicon-generator";
const faviconTitle = "Free Favicon Generator: ICO, PNG & App Icons";
const faviconDescription =
  "Create a complete favicon package from PNG, SVG, JPG or WebP. Preview browser, iPhone and Android icons, then download ICO, PNG, manifest and HTML files.";

type PageProps = {
  params: Promise<{ toolId: string }>;
};

function getAvailableTool(toolId: string) {
  return tools.find((tool) => tool.id === toolId && isToolAvailable(tool));
}

export function generateStaticParams() {
  return tools.filter(isToolAvailable).map((tool) => ({ toolId: tool.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { toolId } = await params;
  const tool = getAvailableTool(toolId);
  if (!tool) return {};

  if (toolId === "favicon-generator") {
    return {
      title: faviconTitle,
      description: faviconDescription,
      keywords: [
        "favicon generator",
        "favicon maker",
        "create favicon",
        "favicon.ico generator",
        "PNG to favicon",
        "SVG to favicon",
        "website icon generator",
        "apple touch icon generator",
        "android chrome icon generator",
        "web app manifest icons",
      ],
      alternates: { canonical: faviconPath },
      openGraph: {
        title: faviconTitle,
        description: faviconDescription,
        type: "website",
        url: `${appUrl}${faviconPath}`,
        siteName: "LocalTools",
        images: [
          {
            url: "/opengraph-image",
            width: 1200,
            height: 630,
            alt: "LocalTools free favicon generator",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: faviconTitle,
        description: faviconDescription,
        images: ["/opengraph-image"],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },
    };
  }

  return {
    title: tool.name.en,
    description: tool.description.en,
    alternates: { canonical: `/tools/${tool.id}` },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { toolId } = await params;
  const tool = getAvailableTool(toolId);
  if (!tool) notFound();

  const canonicalUrl = `${appUrl}/tools/${tool.id}`;
  const isFaviconGenerator = tool.id === "favicon-generator";
  const toolTitle = isFaviconGenerator ? faviconTitle : tool.name.en;
  const toolDescription = isFaviconGenerator
    ? faviconDescription
    : tool.description.en;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${canonicalUrl}#application`,
      name: toolTitle,
      url: canonicalUrl,
      description: toolDescription,
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: isFaviconGenerator
        ? "Favicon generator"
        : tool.category,
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser with JavaScript",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: isFaviconGenerator
        ? [
            "Generate favicon.ico and PNG favicon sizes",
            "Create Apple touch icons",
            "Create Android and maskable PWA icons",
            "Preview icons in browser, iPhone and Android mockups",
            "Export Web Manifest, browserconfig XML and HTML markup",
            "Process images locally without uploads",
          ]
        : [tool.description.en, "Process data locally without uploads"],
      author: {
        "@type": "Person",
        name: "Fr4n0m",
        url: "https://codebyfran.es",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "LocalTools",
          item: appUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Developer tools",
          item: `${appUrl}/tools`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: tool.name.en,
          item: canonicalUrl,
        },
      ],
    },
  ];

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <ToolboxApp
        initialToolId={tool.id as ToolId}
        toolInfo={
          isFaviconGenerator
            ? {
                content: {
                  de: <FaviconSeoContent language="de" />,
                  en: <FaviconSeoContent language="en" />,
                  es: <FaviconSeoContent language="es" />,
                  fr: <FaviconSeoContent language="fr" />,
                  it: <FaviconSeoContent language="it" />,
                },
                label: {
                  de: "Über diesen Favicon-Generator",
                  en: "About this favicon generator",
                  es: "Sobre este generador de favicons",
                  fr: "À propos de ce générateur de favicons",
                  it: "Informazioni sul generatore di favicon",
                },
              }
            : undefined
        }
      />
    </>
  );
}

function FaviconSeoContent({ language }: { language: Language }) {
  const copy = (
    {
      es: {
        eyebrow: "Paquete completo de favicons",
        title: "Crea todos los favicons e iconos que necesita tu web",
        intro:
          "Convierte una imagen PNG, SVG, JPG, WebP, GIF o BMP en un paquete de favicons listo para producción. Revisa el resultado en previews realistas de navegador, iPhone y Android antes de descargar archivos individuales o un ZIP.",
        filesTitle: "Archivos generados",
        files: [
          "favicon.ico y tamaños PNG desde 16×16 hasta 512×512",
          "Apple touch icon para las pantallas de inicio de iPhone y iPad",
          "Iconos Android Chrome y variantes PWA maskable con zona segura",
          "site.webmanifest, browserconfig.xml y HTML listo para copiar",
        ],
        projectsTitle: "Diseñado para proyectos reales",
        projects:
          "Ajusta recorte, escala, fondo, tinte y forma de las esquinas de manera global o por plataforma. Añade un icono dark dedicado, versiona las URLs para controlar la caché y comprueba los modos claro y oscuro antes de exportar.",
        privacyTitle: "Generación privada de favicons",
        privacy:
          "La validación, el renderizado y la creación del ZIP ocurren localmente en tu navegador. La imagen original no se sube a ningún servidor y no necesitas una cuenta. Resulta adecuado para trabajos de clientes, marcas todavía no publicadas y aplicaciones internas.",
      },
      en: {
        eyebrow: "Complete favicon package",
        title: "Create every favicon and app icon your website needs",
        intro:
          "Turn one PNG, SVG, JPG, WebP, GIF or BMP image into a production-ready favicon package. Review the result in realistic browser, iPhone and Android previews before downloading individual files or one ZIP.",
        filesTitle: "Files generated",
        files: [
          "favicon.ico plus PNG sizes from 16×16 to 512×512",
          "Apple touch icon for iPhone and iPad home screens",
          "Android Chrome icons and safe-zone maskable PWA icons",
          "site.webmanifest, browserconfig.xml and ready-to-copy HTML",
        ],
        projectsTitle: "Designed for real projects",
        projects:
          "Adjust crop, scale, background, tint and corner shape globally or per platform. Add a dedicated dark icon, version asset URLs for cache control and preview light and dark appearances before export.",
        privacyTitle: "Private favicon generation",
        privacy:
          "Image validation, rendering and ZIP creation happen locally in your browser. Your source artwork is not uploaded to a server, and no account is required. This makes the generator suitable for private client work, unreleased brands and internal applications.",
      },
      fr: {
        eyebrow: "Pack complet de favicons",
        title: "Créez tous les favicons et icônes nécessaires à votre site",
        intro:
          "Transformez une image PNG, SVG, JPG, WebP, GIF ou BMP en pack de favicons prêt pour la production. Vérifiez le résultat dans des aperçus réalistes de navigateur, iPhone et Android avant de télécharger les fichiers ou le ZIP.",
        filesTitle: "Fichiers générés",
        files: [
          "favicon.ico et tailles PNG de 16×16 à 512×512",
          "Icône Apple Touch pour les écrans d’accueil iPhone et iPad",
          "Icônes Android Chrome et variantes PWA maskable avec zone de sécurité",
          "site.webmanifest, browserconfig.xml et HTML prêt à copier",
        ],
        projectsTitle: "Conçu pour de vrais projets",
        projects:
          "Ajustez le recadrage, l’échelle, le fond, la teinte et la forme des angles globalement ou par plateforme. Ajoutez une icône sombre dédiée, versionnez les URL pour gérer le cache et vérifiez les modes clair et sombre avant l’export.",
        privacyTitle: "Génération privée de favicons",
        privacy:
          "La validation, le rendu et la création du ZIP s’effectuent localement dans votre navigateur. L’image source n’est envoyée à aucun serveur et aucun compte n’est requis.",
      },
      de: {
        eyebrow: "Vollständiges Favicon-Paket",
        title: "Erstelle alle Favicons und App-Symbole für deine Website",
        intro:
          "Verwandle ein PNG-, SVG-, JPG-, WebP-, GIF- oder BMP-Bild in ein produktionsreifes Favicon-Paket. Prüfe das Ergebnis in realistischen Browser-, iPhone- und Android-Vorschauen, bevor du einzelne Dateien oder das ZIP herunterlädst.",
        filesTitle: "Erzeugte Dateien",
        files: [
          "favicon.ico und PNG-Größen von 16×16 bis 512×512",
          "Apple-Touch-Symbol für iPhone- und iPad-Startbildschirme",
          "Android-Chrome-Symbole und maskierbare PWA-Varianten mit Sicherheitszone",
          "site.webmanifest, browserconfig.xml und kopierfertiges HTML",
        ],
        projectsTitle: "Für echte Projekte entwickelt",
        projects:
          "Passe Zuschnitt, Skalierung, Hintergrund, Tönung und Eckenform global oder pro Plattform an. Füge ein eigenes dunkles Symbol hinzu, versioniere URLs für die Cache-Steuerung und prüfe helle und dunkle Ansichten vor dem Export.",
        privacyTitle: "Private Favicon-Erzeugung",
        privacy:
          "Validierung, Rendering und ZIP-Erstellung erfolgen lokal in deinem Browser. Dein Quellbild wird nicht auf einen Server hochgeladen und es ist kein Konto erforderlich.",
      },
      it: {
        eyebrow: "Pacchetto favicon completo",
        title: "Crea tutte le favicon e le icone necessarie al tuo sito",
        intro:
          "Trasforma un’immagine PNG, SVG, JPG, WebP, GIF o BMP in un pacchetto favicon pronto per la produzione. Controlla il risultato nelle anteprime realistiche di browser, iPhone e Android prima di scaricare i singoli file o lo ZIP.",
        filesTitle: "File generati",
        files: [
          "favicon.ico e dimensioni PNG da 16×16 a 512×512",
          "Icona Apple Touch per le schermate Home di iPhone e iPad",
          "Icone Android Chrome e varianti PWA maskable con area sicura",
          "site.webmanifest, browserconfig.xml e HTML pronto da copiare",
        ],
        projectsTitle: "Progettato per progetti reali",
        projects:
          "Regola ritaglio, scala, sfondo, tinta e forma degli angoli globalmente o per piattaforma. Aggiungi un’icona scura dedicata, versiona gli URL per gestire la cache e verifica le modalità chiara e scura prima dell’esportazione.",
        privacyTitle: "Generazione privata delle favicon",
        privacy:
          "La convalida, il rendering e la creazione dello ZIP avvengono localmente nel browser. L’immagine sorgente non viene caricata su alcun server e non è richiesto un account.",
      },
    } satisfies Record<
      Language,
      {
        eyebrow: string;
        title: string;
        intro: string;
        filesTitle: string;
        files: string[];
        projectsTitle: string;
        projects: string;
        privacyTitle: string;
        privacy: string;
      }
    >
  )[language];

  return (
    <article className="favicon-info-content">
      <header>
        <p className="favicon-info-eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p className="favicon-info-intro">{copy.intro}</p>
      </header>

      <div className="favicon-info-grid">
        <section className="favicon-info-section">
          <h3>{copy.filesTitle}</h3>
          <ul>
            {copy.files.map((file) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
        </section>

        <section className="favicon-info-section">
          <h3>{copy.projectsTitle}</h3>
          <p>{copy.projects}</p>
        </section>

        <section className="favicon-info-section favicon-info-privacy">
          <h3>{copy.privacyTitle}</h3>
          <p>{copy.privacy}</p>
        </section>
      </div>
    </article>
  );
}
