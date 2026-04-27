# Add a New Tool

This guide defines the minimum steps to add a new tool to LocalTools.

## 1. Create module folders

Create:

```text
src/modules/<tool-id>/
  domain/
  application/
  presentation/
    components/
    i18n/
```

## 2. Implement domain logic

- Put pure logic in `domain/`.
- Keep it independent from React and browser APIs.

## 3. Add use-case layer

- Add an application use-case in `application/`.
- Orchestrate domain functions here.

## 4. Build presentation component

- Create a React client component in `presentation/components/`.
- Keep it focused on UI and event wiring.
- Reuse shared form primitives from:
  - `src/shared/presentation/components/tool-form.tsx`
  - `src/shared/presentation/components/tool-actions.tsx`

## 5. Add translations

Create:

- `presentation/i18n/en.json`
- `presentation/i18n/es.json`

Rules:

- Keep key names aligned across languages.
- Do not hardcode UI strings in components.

## 6. Register the tool

Edit `src/modules/tool-registry/application/tools.ts` and add one entry with:

- `id`
- `category`
- `icon` (Tabler)
- `component`
- `name` from i18n
- `description` from i18n

## 7. Validate URL behavior

- Tool should open via `/?tool=<tool-id>`.
- Invalid values should fallback to default tool.

## 8. Add tests

- Prioritize domain/application tests.
- Keep tests simple and deterministic.

## 9. Run quality checks

```bash
pnpm lint
pnpm test
pnpm build
```

All three must pass.
