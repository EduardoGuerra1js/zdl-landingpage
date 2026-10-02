# Zero Day Labs — Landing

Landing one-page (español, modo claro como principal) de Zero Day Labs, un estudio de I+D en realidad aumentada y 3D. Fondo WebGL con planeta, coreografía de scroll y un agujero negro en el cierre.

**Stack:** Vite + TypeScript, Three.js, GSAP + ScrollTrigger, Lenis.

## Estado

El proyecto se construye por fases. Revisa [PHASES.md](PHASES.md) para ver qué está hecho y qué sigue, y [.cursor/rules/project.mdc](.cursor/rules/project.mdc) para el contexto completo (marca, arquitectura, rendimiento).

## Comandos

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # typecheck (tsc) + build de producción
npm run preview    # previsualizar el build
npm run typecheck  # solo TypeScript
```

## Estructura

```
src/
  main.ts
  styles/       tokens, base, secciones
  ui/           nav, reveals, microinteracciones
  scene/        SceneManager, QualityManager, ScrollState, objects/, shaders/
public/
  brand/        SVG de marca (logo, isotipo, logotipo), sin metadatos C2PA
  fonts/        Manrope e Inter variables, subconjunto latino (woff2 autoalojado)
  favicon.svg   isotipo color fondo claro
  fallback/     imagen estática del planeta (sin WebGL)
Zero Day Labs - Marca/   manual de marca y SVG originales (referencia)
zero-day-labs-prototype-reference.html   boceto de referencia (no es la fuente final)
```

## Rendimiento (metas)

Lighthouse móvil 90+, LCP < 2.5 s, CLS cercano a 0, JS inicial < 150 KB gzip sin contar Three.js diferido. El 3D se carga tras el primer pintado; el texto nunca espera a WebGL. Detalle en `project.mdc`.
