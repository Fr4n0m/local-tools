import { ToolboxApp } from "@/shared/presentation/components/toolbox-app";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LocalTools",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://localtools.app",
  description:
    "Free browser-based developer toolbox — 32+ tools that run 100% locally. No uploads, no tracking, no accounts.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
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
};

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
