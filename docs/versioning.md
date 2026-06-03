# Versioning Policy

LocalTools uses SemVer and a human-readable changelog because release notes will later feed email updates.

## Sources of Truth

- Current package version: `package.json` `version`.
- Human release notes: `CHANGELOG.md`.
- Work tracking: `.roadmap`.

## Version Bumps

- `MAJOR`: breaking tool behavior, URL contract changes, removed tools, incompatible output changes, or privacy model changes.
- `MINOR`: new tools, new routes, new large UI flows, subscription/mail integration, command palette, or compatible feature additions.
- `PATCH`: bug fixes, accessibility fixes, performance improvements, copy/i18n corrections, visual polish, docs.

## Release Checklist

1. Move completed entries from `CHANGELOG.md` `[Unreleased]` into a dated version.
2. Bump `package.json` version in the same change.
3. Ensure `.roadmap` completed block references the version when relevant.
4. Run `bun run typecheck`.
5. For major/user-facing changes, run `bun run build`.
6. Mention breaking changes explicitly, even when there are none.

## Release Notes Rules

- Keep entries concrete and user-facing where possible.
- Do not include internal-only noise unless it affects reliability, performance, security, or maintainability.
- Group by `Added`, `Changed`, `Fixed`, and `Breaking`.
- Future mail updates should consume only finalized version sections, not `[Unreleased]`.
