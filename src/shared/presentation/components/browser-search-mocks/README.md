# Browser and Search Mocks

Self-contained Chrome-style browser and search-result preview components.

## Public interface

```tsx
import {
  BrowserPreviewMock,
  SearchPreviewCard,
} from "@/shared/presentation/components/browser-search-mocks";

<BrowserPreviewMock
  darkIconUrl="/favicon-dark.svg"
  label="Local Tools"
  lightIconUrl="/favicon.svg"
/>;

<SearchPreviewCard
  iconUrl="/favicon.svg"
  resultLabel="Local Tools"
  siteLabel="Local Tools"
  theme="light"
/>;
```

Only `index.ts` is public. Chrome controls, tab geometry, Google mark, fallback
icons, typography, colors, and responsive behavior are implementation details.

## Export

Copy `src/shared/presentation/components/browser-search-mocks/`.

The components require React and Next.js `Image`. Replace `next/image` with a
plain `img` adapter when publishing outside Next.js. They require no project
assets, domain state, translations, or global utility classes.
