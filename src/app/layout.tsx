import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalTools - Developer Toolbox",
  description: "Private browser-based tools. No uploads, no tracking.",
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
