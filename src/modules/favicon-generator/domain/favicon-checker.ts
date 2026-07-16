export type FaviconReferenceKind = "icon" | "apple" | "manifest" | "config";

export type FaviconReference = {
  href: string;
  kind: FaviconReferenceKind;
};

function readAttribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"),
  );
  return match?.[1]?.trim() || null;
}

export function extractFaviconReferences(html: string): FaviconReference[] {
  const references: FaviconReference[] = [];
  const tags = html.match(/<(?:link|meta)\b[^>]*>/gi) ?? [];

  for (const tag of tags) {
    const rel = readAttribute(tag, "rel")?.toLowerCase() ?? "";
    const relTokens = new Set(rel.split(/\s+/));
    const href = readAttribute(tag, "href");
    if (href && relTokens.has("icon")) {
      references.push({ href, kind: "icon" });
      continue;
    }
    if (href && rel === "apple-touch-icon") {
      references.push({ href, kind: "apple" });
      continue;
    }
    if (href && rel === "manifest") {
      references.push({ href, kind: "manifest" });
      continue;
    }
    if (readAttribute(tag, "name")?.toLowerCase() === "msapplication-config") {
      const content = readAttribute(tag, "content");
      if (content) references.push({ href: content, kind: "config" });
    }
  }

  return references.filter(
    (reference, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.href === reference.href &&
          candidate.kind === reference.kind,
      ) === index,
  );
}
