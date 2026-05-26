import type { Metadata } from "next";

import { LegalPage } from "@/shared/presentation/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "LocalTools privacy policy — all processing runs 100% locally in your browser. Zero data collection, no file uploads, no analytics, no tracking of any kind.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Privacy Policy | LocalTools",
    description:
      "LocalTools processes everything locally in your browser. We collect no data, accept no uploads, and run no tracking.",
    url: "/privacy",
    type: "website",
  },
};

export default function PrivacyPage() {
  return <LegalPage docType="privacy" />;
}
