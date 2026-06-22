# Subscription Status Pages Design

## Scope

Complete the LocalTools email subscription journey with explicit, localized feedback states:

- A home modal for `/?subscription=confirmed` after successful email verification.
- A home modal for `/?subscription=error` when verification fails, expires, or is rate-limited.
- `/unsubscribe?token=...` for confirmation, loading, completed, invalid-token, and request-error states.

The modal and unsubscribe page remain visible until the user chooses an action. There is no timed redirect.

## Visual Direction

Use the approved centered-card composition:

- Full-viewport LocalTools grid background.
- One compact centered card, never nested inside another card.
- Clear status icon, title, short description, and one primary action.
- Restrained border and offset shadow consistent with the home visual system.
- Stable responsive width and spacing on mobile and desktop.
- Existing light/dark theme tokens; no new palette.

The confirmation modal and unsubscribe page form one visual family. Success, error, and confirmation states change content and icon treatment without changing layout dimensions substantially.

## Architecture

### Portfolio bridge

No portfolio changes are required. Its existing verification endpoint already redirects LocalTools to `/?subscription=confirmed` or `/?subscription=error` after validating the token.

### LocalTools confirmation modal

The home overview reads the existing `subscription` query value:

- `confirmed` opens the success modal.
- `error` opens the error modal.
- Missing or unknown values render no modal.

The modal uses the home page's existing language state and ES/EN copy. It does not fetch or mutate subscription data. Closing it or activating its primary action removes the transactional query with `router.replace`, preventing the modal from reopening on refresh or normal home navigation.

### LocalTools unsubscribe route

Keep the existing token parsing and POST contract:

`POST https://codebyfran.es/api/projects/local-tools/unsubscribe`

Refactor presentation to the approved centered-card system. Preserve Zod token validation, Sileo notifications, disabled loading/success behavior, and explicit inline status feedback for accessibility.

## Content States

### Confirmation success modal

- ES title: `Suscripción confirmada`
- EN title: `Subscription confirmed`
- Explain that the user will receive new tools, relevant improvements, and release notes.
- Primary action returns to LocalTools home.

### Confirmation error modal

- Explain that the link is invalid, expired, or could not be processed.
- Primary action returns to the home subscription section (`/#subscribe-updates`) so the user can request another email.

### Unsubscribe

- Confirmation: explain consequences and require explicit button click.
- Loading: disable repeated requests and show processing state.
- Success: replace destructive action with return-home action.
- Invalid token: no API call; show invalid/expired-link message.
- Request error: keep retry available and show Sileo plus inline feedback.

All visible copy is available in Spanish and English. English follows the Spanish meaning exactly.

## Accessibility

- Preserve the home page heading hierarchy; the modal title is not another `h1`.
- Decorative icons use `aria-hidden`.
- Status feedback uses an appropriate live region.
- The modal traps focus, closes with Escape, restores focus, and has an explicit accessible close label.
- Buttons retain visible focus styles and meaningful labels.
- Disabled state is not communicated by opacity alone.
- Text and actions remain within the card at narrow mobile widths.

## Verification

### LocalTools

- Add focused tests for query-state normalization and rendered success/error modal copy where the current test setup supports the component.
- Run `bun run typecheck`.
- Run `bun run build`.
- Run React Doctor after React changes.

### Production smoke test

After both production branches deploy:

1. Submit a new LocalTools subscription.
2. Open the verification email.
3. Confirm the success modal appears over the home in the correct language.
4. Open unsubscribe from the welcome email.
5. Confirm unsubscribe success and repeated-click protection.
6. Open an invalid verification URL and confirm the error landing state.

## Out Of Scope

- Changing subscriber database schema.
- Changing email templates or release notification content.
- Adding account management or authentication.
- Modifying portfolio, cmd-kit, or ngx-contract-kit behavior.
