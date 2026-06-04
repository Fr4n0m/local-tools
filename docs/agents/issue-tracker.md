# Issue tracker: Local Roadmap

## Operational status

- Last reviewed: 2026-06-04
- Active source of truth: `.roadmap` (always update after each completed block)
- Required close flow: update backlog status + append Sprint Log note
- Latest sync: 2026-06-04 theme toggle parity block logged in `.roadmap`.
- Commit discipline: each commit must include tracking deltas in `.roadmap` + `docs/agents/*` when operational status changes.

Issues and tasks for this repo live in `.roadmap` — a living markdown file at the repo root.

## Conventions

- **Sprint Backlog** section: pending tasks as `- [ ] <description>`
- **Sprint Log** section: completed tasks as dated entries with context
- **Active Phases** section: larger scoped phases (A/B/C) with status and sub-tasks
- Triage state is recorded via the canonical label vocabulary (see `triage-labels.md`), mapped to comments or status annotations within `.roadmap` entries

## Known implementation traps

- Global squircle styling applies `corner-shape: squircle` to broad UI selectors. Any intentionally round UI detail, dot, marker, pseudo-element, SVG-like CSS dot layer, avatar, or circular control must explicitly force `corner-shape: round !important` with `border-radius: 50% !important` or an equivalent true circle technique. Do not use clipping as the first fix for generated dot fields because it can remove box-shadow dots outside the source element.

## When a skill says "publish to the issue tracker"

Add a `- [ ]` entry to the **Sprint Backlog** section of `.roadmap` with enough context for an agent to pick it up.

## When a skill says "fetch the relevant ticket"

Read `.roadmap` and locate the matching entry in **Sprint Backlog** or **Active Phases**.

## When a skill says "close / resolve an issue"

Mark the entry `- [x]` in Sprint Backlog and add a dated entry to **Sprint Log** with a summary of what was done.

## When a skill says "update issue status"

Annotate the `.roadmap` entry with a `Status:` note or move it between sections as appropriate.
