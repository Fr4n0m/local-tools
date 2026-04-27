import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
