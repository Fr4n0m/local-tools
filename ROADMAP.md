# Roadmap - LocalTools

Fecha de inicio del roadmap: 24 de abril de 2026

## 1. Estado actual

Completado:

- Base del proyecto con Next.js (App Router), TypeScript, Tailwind y alias `@/`.
- Shell de app tipo SPA (sidebar + topbar + área principal) sin rutas por herramienta.
- Selección de herramienta sincronizada con URL (`?tool=`) y persistencia en `localStorage`.
- i18n modular `en/es` con selector de idioma y prioridad de idioma inicial.
- Tema claro/oscuro con tokens semánticos y persistencia.
- Tool registry central con categorías y búsqueda en tiempo real por nombre/descripcion.
- Tooling de calidad: ESLint, Prettier, Husky, lint-staged, Vitest.
- Herramientas V1 implementadas (nivel base funcional):
  - image converter
  - favicon generator
  - json formatter/validator
  - base64 encoder/decoder
  - url encoder/decoder
  - text transformer
  - uuid generator
  - batch rename (simulación)

Progreso P0 ya ejecutado:

- Hook de Husky actualizado para evitar el warning deprecado.
- `eslint` configurado para ignorar `coverage/**`.
- Tests añadidos para `url encoder`, `text transformer`, `batch rename` y `uuid`.
- Dominio de UUID endurecido con normalizacion de cantidad (1..100, entero, finito).
- Acciones compartidas (`copiar` y `limpiar`) unificadas en tools de texto principales.
- Mejora a11y del drawer movil: `role=dialog`, `aria-modal`, cierre por tecla `Escape`.
- Hardening de herramientas de archivos con limpieza de `ObjectURL` en convertidor y favicon.
- Estilo global de foco visible para navegacion por teclado.

Progreso P1 ya ejecutado:

- Soporte de `drag & drop` en `image converter` y `favicon generator`.
- Descarga ZIP en `favicon generator` (client-side).
- Feedback de error JSON con linea/columna.
- Acciones compartidas (`copiar`/`limpiar`) añadidas tambien en `batch rename`.
- Preview antes/despues en `image converter`.

## 2. Objetivo de producto (MVP)

Entregar una toolbox privada, rapida y 100% client-side con UX de app nativa, calidad de codigo mantenible y base lista para escalar nuevas herramientas sin romper arquitectura.

## 3. Backlog priorizado

## P0 - Cierre tecnico del MVP (bloqueante)

- Ajustar hook de Husky para evitar warning deprecado en v10.
- Endurecer validaciones de herramientas (errores, limites, casos borde).
- Uniformar estilos de inputs/botones/resultados entre todas las tools.
- Añadir utilidades compartidas para descarga/copy/toast para evitar duplicacion.
- Revisar accesibilidad base:
  - labels/aria en controles
  - focus visible
  - contraste en light/dark
  - navegacion teclado en drawer/menu
- Añadir pruebas de dominio/aplicacion faltantes:
  - url encoder
  - text transformer
  - batch rename
  - uuid generator
- Criterio de cierre P0:
  - `pnpm lint`, `pnpm test`, `pnpm build` en verde
  - sin warnings criticos en consola
  - cobertura minima de logica core >= 85%

## P1 - Refinamiento funcional y UX

- Image Converter:
  - soporte drag and drop
  - preview antes/despues
  - conversion por lotes simple
- Favicon Generator:
  - descarga ZIP del set generado
  - `manifest` y snippet HTML opcional
- JSON Formatter:
  - minify + ordenar claves opcional
  - mejor feedback de error (linea/columna)
- Base64/URL:
  - botones copiar/limpiar
  - mensajes de error consistentes
- Text Transformer:
  - modos extra (slugify, remove spaces, normalize)
- UUID Generator:
  - opcion sin guiones
  - version por lotes exportable txt
- Batch Rename:
  - reglas numeracion/prefijo/sufijo
  - vista diff mas clara
- Criterio de cierre P1:
  - UX consistente en mobile/desktop
  - todas las herramientas con feedback inmediato y acciones principales completas

## P2 - Calidad de producto y preparacion release

- Documentacion de arquitectura por modulo (domain/application/infrastructure/presentation).
- Guia para crear nuevas tools en 1 registro + 1 modulo (template).
- Checklist de privacidad visible en UI y README.
- Auditoria de rendimiento (Lighthouse) y ajustes de CWV.
- Auditoria a11y final (WCAG 2.1 AA en flujo principal).
- SEO basico para landing/app shell (title, meta, open graph).
- Criterio de cierre P2:
  - Lighthouse >= 90 en Performance/Best Practices/SEO (en entorno release)
  - sin issues a11y severos abiertos

## 4. Cronograma sugerido

Semana 1 (24 abril - 30 abril 2026):

- Completar P0 y dejar baseline robusto.

Semana 2 (1 mayo - 7 mayo 2026):

- Ejecutar P1 en herramientas de mayor uso (JSON, Image, Base64/URL).

Semana 3 (8 mayo - 14 mayo 2026):

- Cerrar P1 restante + iniciar P2 (docs, privacidad, auditorias).

Semana 4 (15 mayo - 21 mayo 2026):

- Cierre P2, hardening final y release candidate.

## 5. Definicion de terminado (DoD global)

- Arquitectura respetada (sin logica de negocio en UI).
- Todo texto en i18n `en/es`, sin hardcodeos en componentes.
- Persistencia limitada a: idioma, tema, herramienta seleccionada.
- Sin tracking, sin backend, sin llamadas de procesamiento externo.
- Calidad automatizada en pre-commit + CI local reproducible.
- App usable y estable en mobile y desktop.

## 6. Proxima ejecucion inmediata

Orden recomendado para el siguiente bloque de trabajo:

1. Arreglar hook Husky deprecado.
2. Completar tests faltantes de domain/application.
3. Homogeneizar UI compartida (acciones copiar/limpiar/descargar).
4. Mejorar accesibilidad teclado/aria del drawer y controles.
5. Cerrar P0 con validacion final (`lint` + `test` + `build`).
6. Añadir preview antes/despues en `image converter`.
7. Añadir `manifest` + snippet HTML en `favicon generator`.
8. Implementar minify y ordenado de claves en JSON formatter.
