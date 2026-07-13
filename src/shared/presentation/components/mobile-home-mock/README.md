# Mobile Home Mock

Self-contained iPhone and Android home-screen preview module.

## Public interface

```tsx
import { MobileHomeMock } from "@/shared/presentation/components/mobile-home-mock";

<MobileHomeMock
  appIconUrl="/icon.svg"
  appName="My App"
  language="es"
  platform="ios"
  theme="dark"
/>;
```

Only `index.ts` is public. Frame SVGs, device layout, labels, decorative apps,
fonts, wallpapers, and theme rules are implementation details.

## Export

Copy both:

- `src/shared/presentation/components/mobile-home-mock/`
- `public/assets/mobile-home-mocks/`

The component requires React and Next.js `Image`. Replace `next/image` with a
plain `img` adapter when publishing outside Next.js. Asset URLs deliberately
share the single `/assets/mobile-home-mocks/` namespace.

Before public redistribution, verify the licenses and attribution requirements
of the Apple/Google fonts, device frames, Figma icon exports, and wallpapers.
