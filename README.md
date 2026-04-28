# LocalTools

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=000)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.x-6E9F18?logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9.x-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3.x-F7B93E?logo=prettier&logoColor=000)

Quick navigation: [Español](#es) | [English](#en)

---

<a id="es"></a>

## 🇪🇸 Español

### 🧰 Qué es LocalTools

LocalTools es una toolbox privada para desarrolladores que funciona 100% en el navegador. Todo el procesamiento es local: sin backend, sin autenticación, sin tracking y sin subidas de archivos.

### ✨ Características principales

- Aplicación SPA con shell única: sidebar + topbar + área de herramienta.
- Cambio instantáneo entre herramientas sin rutas separadas.
- Estado sincronizado por URL (`?tool=<id>`).
- i18n completo (`es` y `en`) desde JSON.
- Tema claro/oscuro y preferencias persistidas en `localStorage`.
- Densidad visual global (comfortable/compact) para una UI más limpia.

### 🧩 Herramientas incluidas

- Conversor de Imágenes
- Generador de Favicons
- Formateador y Validador JSON
- Comprobador de Contraste (WCAG)
- Codificador/Decodificador Base64
- Generador de QR
- Codificador/Decodificador URL
- Transformador de Texto
- Generador de Texto Placeholder
- Generador UUID
- Simulador de Renombrado Masivo

### 🛠️ Stack técnico

- Next.js App Router + TypeScript
- Tailwind CSS + componentes estilo shadcn
- Tabler Icons
- Vitest + React Testing Library
- ESLint + Prettier + Husky + lint-staged

### 🚀 Desarrollo local

```bash
pnpm install
pnpm dev
```

Scripts útiles:

```bash
pnpm lint
pnpm test
pnpm build
```

### 🏗️ Arquitectura y guía de herramientas

- Arquitectura: [docs/architecture.md](docs/architecture.md)
- Cómo añadir una tool: [docs/add-tool-guide.md](docs/add-tool-guide.md)

### 🤝 Contribuciones

Este proyecto está abierto a mejoras. Si quieres contribuir:

- Abre un issue con contexto claro.
- Envía PRs pequeños y enfocados.
- Incluye cambios de i18n (`es/en`) cuando afectes UI.
- Añade o ajusta tests cuando toques lógica de herramientas.

Las PRs bien definidas y con buen contexto se revisan más rápido.

### ☕ Apoya el proyecto

Si LocalTools te resulta útil, puedes invitarme a un café:

- https://buymeacoffee.com/fran11799

### 💡 Roadmap de soporte

- Fase actual (simple): aportes vía Buy Me a Coffee / Patreon.
- Fase opcional: Stripe Payment Links (pago único o suscripción) sin backend propio.
- Fase futura: Stripe completo solo si el producto evoluciona a modelo con backend/auth.

---

<a id="en"></a>

## 🇬🇧 English

### 🧰 What is LocalTools

LocalTools is a private developer toolbox that runs 100% in the browser. All processing is local: no backend, no auth, no tracking, and no file uploads.

### ✨ Key features

- Single-page app shell: sidebar + topbar + tool workspace.
- Instant tool switching without per-tool routes.
- URL-synced state (`?tool=<id>`).
- Full i18n (`es` and `en`) from JSON files.
- Light/dark theme and persisted preferences in `localStorage`.
- Global density mode (comfortable/compact) for cleaner UI.

### 🧩 Included tools

- Image Converter
- Favicon Generator
- JSON Formatter & Validator
- Contrast Checker (WCAG)
- Base64 Encoder/Decoder
- QR Code Generator
- URL Encoder/Decoder
- Text Transformer
- Placeholder Text Generator
- UUID Generator
- Batch Rename Simulator

### 🛠️ Tech stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style components
- Tabler Icons
- Vitest + React Testing Library
- ESLint + Prettier + Husky + lint-staged

### 🚀 Local development

```bash
pnpm install
pnpm dev
```

Useful scripts:

```bash
pnpm lint
pnpm test
pnpm build
```

### 🏗️ Architecture and tool guide

- Architecture: [docs/architecture.md](docs/architecture.md)
- How to add a tool: [docs/add-tool-guide.md](docs/add-tool-guide.md)

### 🤝 Contributing

Contributions are welcome:

- Open an issue with clear context.
- Submit focused, small PRs.
- Update i18n (`es/en`) when UI changes.
- Add or adjust tests when tool logic changes.

Well-scoped PRs with context get reviewed faster.

### ☕ Support the project

If LocalTools helps you, you can support it here:

- https://buymeacoffee.com/fran11799

### 💡 Support roadmap

- Current phase (simple): support via Buy Me a Coffee / Patreon.
- Optional phase: Stripe Payment Links (one-time or subscription) without custom backend.
- Future phase: full Stripe integration only if the product evolves to a backend/auth model.

---

Portfolio: **Fr4n0m** → https://codebyfran.es
