import type { Metadata } from "next";

import { LegalPage } from "@/shared/presentation/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "LocalTools terms of service — free, open-source developer tools that run entirely in your browser with no accounts, no uploads, and no data collection.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Terms of Service | LocalTools",
    description:
      "Free, open-source developer tools. No accounts. No uploads. No data collection.",
    url: "/terms",
    type: "website",
  },
};

export default function TermsPage() {
  return <LegalPage docType="terms" />;
}
