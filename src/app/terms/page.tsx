import type { Metadata } from "next";

import { LegalPage } from "@/shared/presentation/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "LocalTools terms of service — permitted use, local browser tools, optional update subscriptions, availability, and applicable conditions.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Terms of Service | LocalTools",
    description:
      "Terms covering LocalTools browser utilities, optional update subscriptions, acceptable use, availability, and legal conditions.",
    url: "/terms",
    type: "website",
  },
};

export default function TermsPage() {
  return <LegalPage docType="terms" />;
}
