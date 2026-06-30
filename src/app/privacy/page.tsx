import type { Metadata } from "next";

import { LegalPage } from "@/shared/presentation/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "LocalTools privacy policy — local browser processing, optional email subscription data, functional storage, providers, retention, and data rights.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Privacy Policy | LocalTools",
    description:
      "How LocalTools handles local tool data, optional email subscriptions, browser storage, providers, retention, and privacy rights.",
    url: "/privacy",
    type: "website",
  },
};

export default function PrivacyPage() {
  return <LegalPage docType="privacy" />;
}
