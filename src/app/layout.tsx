import type { Metadata } from "next";
import localFont from "next/font/local";
import { GlobalFooter } from "@/shared/presentation/components/global-footer";
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
const appDescription =
  "Private browser-based developer toolbox. 100% local processing with no uploads or tracking.";

export const metadata: Metadata = {
  title: {
    default: `${appName} - Developer Toolbox`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  applicationName: appName,
  keywords: [
    "developer tools",
    "browser tools",
    "image converter",
    "json formatter",
    "base64",
    "url encoder",
    "uuid",
    "privacy-first",
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
  },
  openGraph: {
    title: `${appName} - Developer Toolbox`,
    description: appDescription,
    type: "website",
    locale: "en_US",
    siteName: appName,
  },
  twitter: {
    card: "summary",
    title: `${appName} - Developer Toolbox`,
    description: appDescription,
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
        <NotificationHost />
      </body>
    </html>
  );
}
