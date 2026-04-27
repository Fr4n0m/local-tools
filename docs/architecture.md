# Architecture Overview

LocalTools follows a pragmatic modular architecture with clear boundaries between UI and business logic.

## Goals

- Keep tools independent and easy to extend.
- Keep business logic testable and framework-agnostic.
- Keep browser-specific code isolated from domain logic.

## Layer model

Each tool module is split into:

- `domain`: Pure functions with business rules.
- `application`: Use-cases that orchestrate domain logic.
- `presentation`: React components and i18n JSON.
- `infrastructure` (optional): Browser API wrappers when needed.

## Current structure

```text
src/
  app/                      # App Router shell and global styles
  modules/
    <tool-name>/
      domain/
      application/
      presentation/
        components/
        i18n/
  shared/
    lib/                    # Cross-tool utilities
    presentation/
      components/           # Shared UI components
      i18n/                 # Shared UI translations (en/es)
```

## UI shell responsibilities

- Sidebar + topbar + tool workspace.
- Tool selection synchronized with URL query `?tool=<id>`.
- Persist only:
  - `localtools.language`
  - `localtools.theme`
  - `localtools.tool`
  - `localtools.density`

## Tool registry

- Source of truth: `src/modules/tool-registry/application/tools.ts`.
- Sidebar and search derive from this registry.
- Adding a tool means registering it once.

## i18n strategy

- Every tool owns its own `en.json` and `es.json`.
- Shared shell strings live in `src/shared/presentation/i18n`.
- UI must not hardcode user-facing text.

## Quality gates

- `pnpm lint`
- `pnpm test`
- `pnpm build`

These commands must pass before shipping changes.
