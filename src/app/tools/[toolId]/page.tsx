import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { tools } from "@/modules/tool-registry/application/tools";
import {
  isToolAvailable,
  type ToolId,
} from "@/modules/tool-registry/domain/tool";
import { ToolboxApp } from "@/shared/presentation/components/toolbox-app";

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
                  en: <FaviconSeoContent language="en" />,
                  es: <FaviconSeoContent language="es" />,
                },
                label: {
                  en: "About this favicon generator",
                  es: "Sobre este generador de favicons",
                },
              }
            : undefined
        }
      />
    </>
  );
}

function FaviconSeoContent({ language }: { language: "en" | "es" }) {
  const copy =
    language === "es"
      ? {
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
        }
      : {
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
        };

  return (
    <article className="grid gap-6 text-foreground md:grid-cols-2">
      <header className="space-y-3 md:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/55">
          {copy.eyebrow}
        </p>
        <h2 className="max-w-4xl text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
          {copy.title}
        </h2>
        <p className="max-w-3xl leading-7 text-foreground/68">{copy.intro}</p>
      </header>

      <section className="space-y-3 rounded-2xl bg-[var(--tool-control-bg)] p-5">
        <h3 className="text-lg font-semibold">{copy.filesTitle}</h3>
        <ul className="grid gap-2 text-sm leading-6 text-foreground/68">
          {copy.files.map((file) => (
            <li key={file}>{file}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl bg-[var(--tool-control-bg)] p-5">
        <h3 className="text-lg font-semibold">{copy.projectsTitle}</h3>
        <p className="text-sm leading-6 text-foreground/68">{copy.projects}</p>
      </section>

      <section className="space-y-2 md:col-span-2">
        <h3 className="text-lg font-semibold">{copy.privacyTitle}</h3>
        <p className="max-w-3xl text-sm leading-6 text-foreground/68">
          {copy.privacy}
        </p>
      </section>
    </article>
  );
}
