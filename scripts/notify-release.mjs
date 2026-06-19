#!/usr/bin/env node
// Usage: node scripts/notify-release.mjs <packageName> <version> <changelogUrl> [locale]
// Requires PROJECT_NOTIFY_API_KEY env var.

const [packageName, version, changelogUrl, locale = "es"] = process.argv.slice(2);

if (!packageName || !version || !changelogUrl) {
  console.error("Usage: notify-release.mjs <packageName> <version> <changelogUrl> [locale]");
  process.exit(1);
}

const apiKey = process.env.PROJECT_NOTIFY_API_KEY;
if (!apiKey) {
  console.error("Missing PROJECT_NOTIFY_API_KEY env var");
  process.exit(1);
}

const res = await fetch("https://www.codebyfran.es/api/projects/local-tools/notify", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({ packageName, version, changelogUrl, locale }),
});

const data = await res.json();

if (!res.ok) {
  console.error("Notify failed:", JSON.stringify(data));
  process.exit(1);
}

console.log(`Sent to ${data.sent} subscriber(s).`);
