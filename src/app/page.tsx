import { ToolboxApp } from "@/shared/presentation/components/toolbox-app";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtools.app";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LocalTools",
    url: appUrl,
    description:
      "Free browser-based developer toolbox — 32+ tools that run 100% locally. No uploads, no tracking, no accounts.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Image Converter",
      "Image Compressor",
      "HEIC to JPG",
      "PDF Compressor",
      "PDF to Images",
      "Video Compressor",
      "JSON Formatter & Validator",
      "Base64 Encoder/Decoder",
      "URL Encoder/Decoder",
      "UUID Generator",
      "QR Code Generator",
      "SVG to File",
      "Favicon Generator",
      "Color Range Generator",
      "Contrast Checker",
      "Mesh Gradient Generator",
      "Loader Maker",
      "Text Transformer",
      "Batch Rename Simulator",
      "Placeholder Text Generator",
      "100% local processing",
      "No uploads",
      "No tracking",
      "No account required",
    ],
    screenshot: `${appUrl}/opengraph-image`,
    author: {
      "@type": "Person",
      name: "Fr4n0m",
      url: "https://codebyfran.es",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LocalTools",
    url: appUrl,
    description:
      "Free browser-based developer toolbox — 32+ tools that run 100% locally.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${appUrl}/?tool={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LocalTools",
    url: appUrl,
    logo: `${appUrl}/favicon-96x96.png`,
    sameAs: ["https://github.com/Fr4n0m/local-tools"],
  },
];

export default function Home() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <ToolboxApp />
    </>
  );
}
