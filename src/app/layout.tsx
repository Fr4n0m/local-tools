import type { Metadata } from "next";
import localFont from "next/font/local";
import { GlobalFooter } from "@/shared/presentation/components/global-footer";
import { GlobalCommandPalette } from "@/shared/presentation/components/global-command-palette";
import { NotificationHost } from "@/shared/presentation/components/notification-host";
import "./globals.css";

const archivo = localFont({
  src: "./fonts/Archivo-VariableFont_wdth,wght.ttf",
  display: "swap",
  variable: "--font-body",
  weight: "100 900",
});

const archivoHeading = localFont({
  src: "./fonts/Archivo-VariableFont_wdth,wght.ttf",
  display: "swap",
  variable: "--font-heading",
  weight: "100 900",
});

const ibmPlexMono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexMono-Medium.ttf", weight: "500", style: "normal" },
    {
      path: "./fonts/IBMPlexMono-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    { path: "./fonts/IBMPlexMono-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-mono",
});

const appName = "LocalTools";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtools.app";
const appDescription =
  "Free browser-based developer toolbox — 32+ tools that run 100% locally. No uploads, no tracking, no accounts. Image converter, JSON formatter, QR code generator, Base64, UUID, color tools and more.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${appName} - Free Developer Toolbox`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  applicationName: appName,
  keywords: [
    "developer tools",
    "browser tools",
    "privacy-first tools",
    "offline tools",
    "local processing",
    "no upload",
    "image converter",
    "image compressor",
    "HEIC to JPG",
    "PDF compressor",
    "PDF to images",
    "video compressor",
    "JSON formatter",
    "JSON validator",
    "Base64 encoder decoder",
    "URL encoder decoder",
    "UUID generator",
    "QR code generator",
    "SVG converter",
    "favicon generator",
    "color picker",
    "contrast checker",
    "mesh gradient generator",
    "loader maker",
    "text transformer",
    "batch rename",
    "markdown tools",
    "free developer tools",
    "open source tools",
  ],
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: appName,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
  openGraph: {
    title: `${appName} - Free Developer Toolbox`,
    description: appDescription,
    type: "website",
    url: appUrl,
    locale: "en_US",
    siteName: appName,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${appName} — Free Developer Toolbox`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - Free Developer Toolbox`,
    description: appDescription,
    creator: "@fr4n0m",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${archivo.variable} ${archivoHeading.variable} ${ibmPlexMono.variable}`}
      >
        {children}
        <GlobalFooter />
        <GlobalCommandPalette />
        <NotificationHost />
      </body>
    </html>
  );
}
