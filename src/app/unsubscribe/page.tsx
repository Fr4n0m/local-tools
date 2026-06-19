import type { Metadata } from "next";
import { UnsubscribeClient } from "./unsubscribe-client";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Cancel LocalTools email updates.",
  alternates: { canonical: "/unsubscribe" },
  robots: { index: false, follow: false },
};

type UnsubscribePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const params = await searchParams;
  const rawToken = params?.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  return <UnsubscribeClient token={token ?? ""} />;
}
