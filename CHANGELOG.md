# Changelog

All notable LocalTools changes are tracked here.

Format follows Keep a Changelog style. Versioning follows SemVer:

- `MAJOR`: breaking UX, URL, data, or tool behavior changes.
- `MINOR`: new tools, visible features, or compatible workflow changes.
- `PATCH`: fixes, copy updates, perf, accessibility, internal polish.

## [Unreleased]

### Added

- Global command palette and keyboard-first navigation layer.
- Shared image comparison workbench for image conversion workflows.
- Drag-and-drop intake support across image tools.
- Shared camera-style convert/download interaction reused across image tools.
- Advanced browser-side codec support for AVIF, JPEG XL, and QOI in the image converter.
- Explicit React Doctor policy file and Lighthouse CI configuration.
- Formal minimum Vitest coverage thresholds for statements, branches, functions, and lines.

### Changed

- Image Converter moved toward a Squoosh-style workflow with before/after comparison, resize controls, richer output handling, and clearer conversion/download states.
- Image Compressor and HEIC to JPG now reuse the shared comparison/download workflow pattern.
- Mesh Gradient tool gained better randomization control, richer export options, and updated interaction behavior.
- Tools index responsive grid was reworked to use stable multi-column behavior across mobile, desktop, and 4K layouts.
- Legal subscription copy in privacy/terms/overview was aligned with the current mail-subscription flow.
- Public SVG/icon assets were tightened to reduce payload size.
- Quality policy is now reproducible in-repo instead of relying on one-off checks.

### Fixed

- Production build stability for advanced image codecs; the converter no longer depends on the earlier webpack-only workaround.
- `pnpm-lock.yaml` drift after image-codec dependency changes.
- Image conversion filename, preview/state consistency, and download-flow regressions covered during the image workflow rewrite.
- Browser language/theme and related UI workflow edges polished across the latest tool pass.
- Removed unused `@jsquash/jpeg` and `@jsquash/webp` dependencies from the manifest and lockfile.

### Breaking

- None.

## [0.1.0] - 2026-06-02

### Added

- Initial LocalTools release baseline.
- Browser-only toolbox architecture.
- `/` product overview and `/tools` toolbox route.
- Shared UI primitives, i18n, theme, density, notifications, and local tool registry.

### Breaking

- None.
