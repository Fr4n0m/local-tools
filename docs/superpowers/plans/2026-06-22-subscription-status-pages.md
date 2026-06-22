# Subscription Status Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show localized subscription confirmation/error feedback in an accessible home modal and finish the localized unsubscribe page with the same centered-card visual system.

**Architecture:** Keep the portfolio bridge unchanged and consume its existing `?subscription=confirmed|error` query in the Next.js home route. Normalize the query server-side, pass a narrow status prop into the client overview, and render an accessible modal that clears the query when dismissed. Extract a shared subscription status card so the home modal and `/unsubscribe` page use one visual language without coupling their behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Tabler icons, Zod, Sileo, Vitest, Testing Library.

---

## File Structure

- Create `src/app/overview/subscription-status.ts`: normalize untrusted query values into `confirmed | error | null`.
- Create `src/app/overview/components/subscription-status-modal.tsx`: modal behavior, focus management, localized status presentation.
- Create `src/app/overview/components/subscription-status-modal.module.css`: overlay and responsive modal layout.
- Create `src/app/subscription/components/subscription-status-card.tsx`: shared centered-card presentation.
- Create `src/app/subscription/components/subscription-status-card.module.css`: card, icon, copy, and action styles.
- Modify `src/app/overview/overview-experience.tsx`: read the query after hydration, show modal, and clear/query-navigate with `router.replace` while preserving a static home route.
- Modify `src/shared/presentation/i18n/es.json` and `en.json`: exact confirmation/error modal copy.
- Modify `src/app/unsubscribe/unsubscribe-client.tsx`: use the shared card and complete state-specific actions/live feedback.
- Modify `src/app/unsubscribe/unsubscribe.module.css`: retain only route shell/layout styles.
- Create `src/tests/subscription-status.test.tsx`: query normalization and modal interaction tests.
- Create `src/tests/unsubscribe.test.tsx`: invalid token and successful unsubscribe behavior.
- Modify `.roadmap`: record completion and remaining production smoke task.

### Task 1: Normalize subscription query state

**Files:**

- Create: `src/app/overview/subscription-status.ts`
- Create: `src/tests/subscription-status.test.tsx`

- [ ] **Step 1: Write failing normalization tests**

Test `confirmed`, `error`, arrays, missing values, and unknown values. Expected contract:

```ts
export type SubscriptionStatus = "confirmed" | "error";

export function normalizeSubscriptionStatus(
  value: string | string[] | undefined,
): SubscriptionStatus | null;
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `bunx vitest run src/tests/subscription-status.test.tsx`

Expected: failure because `subscription-status.ts` does not exist.

- [ ] **Step 3: Implement the normalizer**

```ts
export type SubscriptionStatus = "confirmed" | "error";

export function normalizeSubscriptionStatus(
  value: string | string[] | undefined,
): SubscriptionStatus | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "confirmed" || candidate === "error" ? candidate : null;
}
```

- [ ] **Step 4: Run focused test and verify pass**

Run: `bunx vitest run src/tests/subscription-status.test.tsx`

Expected: normalization tests pass.

### Task 2: Build shared centered status card

**Files:**

- Create: `src/app/subscription/components/subscription-status-card.tsx`
- Create: `src/app/subscription/components/subscription-status-card.module.css`

- [ ] **Step 1: Implement a narrow presentational API**

```tsx
type SubscriptionStatusCardProps = {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  titleAs: "h1" | "h2";
  description: string;
  children: ReactNode;
  feedback?: ReactNode;
  tone?: "default" | "success" | "error";
};
```

The card renders a semantic heading supplied by the caller through `titleAs="h1" | "h2"`, keeps icons decorative, and exposes stable slots for actions and live feedback.

- [ ] **Step 2: Implement approved option-B styling**

Use a responsive maximum width around `32rem`, centered text, one-pixel token border, restrained offset shadow, stable icon circle, and existing theme variables. Buttons remain normal command controls, with visible `:focus-visible`, hover, and disabled states.

- [ ] **Step 3: Run typecheck**

Run: `bun run typecheck`

Expected: pass.

### Task 3: Add confirmation/error modal to home

**Files:**

- Create: `src/app/overview/components/subscription-status-modal.tsx`
- Create: `src/app/overview/components/subscription-status-modal.module.css`
- Modify: `src/app/overview/overview-experience.tsx`
- Modify: `src/shared/presentation/i18n/es.json`
- Modify: `src/shared/presentation/i18n/en.json`
- Test: `src/tests/subscription-status.test.tsx`

- [ ] **Step 1: Add failing modal tests**

Cover:

- confirmed status renders `Suscripción confirmada` for Spanish copy.
- error status renders the invalid/expired-link message.
- Escape invokes `onClose`.
- close button has an accessible name.
- Tab remains within modal controls.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `bunx vitest run src/tests/subscription-status.test.tsx`

Expected: modal tests fail because the component does not exist.

- [ ] **Step 3: Add exact ES/EN copy**

Add `subscriptionModal` under `overview` in both message files with these fields:

```ts
{
  (confirmedEyebrow,
    confirmedTitle,
    confirmedDescription,
    confirmedAction,
    errorEyebrow,
    errorTitle,
    errorDescription,
    errorAction,
    closeLabel);
}
```

English must preserve the Spanish meaning: confirmation, useful updates only, invalid/expired link, and requesting another verification email.

- [ ] **Step 4: Implement accessible modal behavior**

Render only for a non-null status. On mount:

- save the previously focused element;
- focus the close button;
- lock body scrolling;
- close on Escape;
- trap Tab/Shift+Tab between close and primary action;
- restore focus and body overflow on cleanup.

Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and a fixed backdrop. Backdrop click may close; card clicks must stop propagation.

- [ ] **Step 5: Integrate query state without touching portfolio**

In `OverviewExperience`, read `window.location.search` after hydration and normalize the `subscription` value. This keeps `/` statically generated. Use `useRouter()`:

- close and confirmed primary action: `router.replace("/", { scroll: false })`;
- error primary action: `router.replace("/#subscribe-updates")`.

Keep the modal outside the animated `<main>` so GSAP selectors and page transforms do not affect it.

- [ ] **Step 6: Run focused tests and typecheck**

Run:

```bash
bunx vitest run src/tests/subscription-status.test.tsx
bun run typecheck
```

Expected: all pass.

### Task 4: Finish unsubscribe page states and visual system

**Files:**

- Modify: `src/app/unsubscribe/unsubscribe-client.tsx`
- Modify: `src/app/unsubscribe/unsubscribe.module.css`
- Create: `src/tests/unsubscribe.test.tsx`

- [ ] **Step 1: Write failing unsubscribe tests**

Cover:

- missing token renders invalid/expired state and does not call `fetch`;
- valid token renders explicit confirmation action;
- successful POST changes card to completed state;
- failed POST keeps retry available and renders inline error feedback;
- loading/success prevent duplicate requests.

- [ ] **Step 2: Run test and verify failure**

Run: `bunx vitest run src/tests/unsubscribe.test.tsx`

Expected: assertions for completed card structure and retry state fail.

- [ ] **Step 3: Refactor to shared card**

Keep existing Zod validation and endpoint. Render distinct card content for:

- invalid token;
- idle confirmation;
- loading;
- success;
- request error.

Use `aria-live="polite"` for processing/success and `role="alert"` for invalid/error messages. After success, remove the destructive button and show only `Volver a LocalTools`.

- [ ] **Step 4: Reduce route CSS to shell concerns**

Keep the full-viewport grid background and responsive page padding in `unsubscribe.module.css`. Move shared card/action styling into `subscription-status-card.module.css`.

- [ ] **Step 5: Run focused tests and typecheck**

Run:

```bash
bunx vitest run src/tests/unsubscribe.test.tsx
bun run typecheck
```

Expected: all pass.

### Task 5: Quality gate and roadmap sync

**Files:**

- Modify: `.roadmap`

- [ ] **Step 1: Run project verification**

Run:

```bash
bun run typecheck
bun run build
npx -y react-doctor@latest . --verbose --diff
```

Expected: typecheck/build pass; React Doctor introduces no new issue from changed files.

- [ ] **Step 2: Update roadmap**

Mark confirmation modal and unsubscribe ES/EN styling complete. Keep release notification production test open. Record exact verification commands and results.

- [ ] **Step 3: Review git scope**

Confirm no `.superpowers/`, `.vscode/`, Playwright output, screenshots, or unrelated user files are staged. Keep the previously requested final-section gap change in its own functional commit.

- [ ] **Step 4: Commit functional blocks**

Use concrete commits without attribution trailers:

```bash
git commit -m "feat: add subscription confirmation modal"
git commit -m "feat: finish unsubscribe status page"
git commit -m "style: separate final home cards"
```
