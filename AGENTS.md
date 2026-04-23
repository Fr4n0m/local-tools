<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# LocalTools Project Instructions (Persistent)

Always follow these project rules:

- Product: LocalTools, private browser-based developer toolbox.
- Architecture: Next.js App Router + TypeScript + Tailwind + shadcn-style components + Tabler Icons.
- Runtime constraints: 100% client-side for tool processing, no backend, no auth, no tracking, no uploads.
- UX: single-page app shell with sidebar + top bar + tool area, instant switching, no routes per tool.
- URL state: selected tool must sync via `?tool=<id>`.
- Registry: tools must be declared once in central registry; sidebar and search derive from it.
- i18n: all UI text from JSON with `en` and `es`; no hardcoded UI strings.
- Theming: support light/dark with semantic tokens and CSS variables; persist theme/language/tool in `localStorage`.
- State management: React hooks only (`useState`, `useReducer`, `useContext` only when needed).
- Tooling: ESLint, Prettier, Husky, lint-staged, Vitest + RTL.
- Keep dependencies minimal and prefer native browser APIs.

Reference specification file for full details:

- `codex instruction.txt`
