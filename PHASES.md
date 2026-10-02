# Zero Day Labs — Registro de fases

Catálogo vivo del avance de la landing. El contexto general del proyecto está en [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc) y los prompts maestros en [`zero-day-labs-cursor-prompts.md`](zero-day-labs-cursor-prompts.md).

## Cómo mantener este archivo (obligatorio)

Al **cerrar cada fase**, rellena su entrada con:

1. **Estado** y fecha de cierre.
2. **Resumen de cambios hechos:** archivos creados/modificados y las decisiones tomadas (por qué, no solo qué).
3. **Desviaciones** respecto al plan (o "ninguna").
4. **Handoff a la siguiente fase:** qué le toca avanzar, qué dejó listo esta fase para que lo use, y pendientes o riesgos conocidos.

Al **empezar una fase**, lee primero el "Handoff" de la fase anterior. No se marca una fase como `Completada` hasta que sus cuatro apartados estén llenos. Una fase = un commit (o grupo de commits) lógico.

Estados: `Pendiente` · `En curso` · `Completada`.

### Plantilla de entrada

```md
### Fase N — Nombre · Modelo
**Estado:** Completada · YYYY-MM-DD

**Resumen de cambios**
- `ruta/archivo` — qué se hizo y por qué.

**Desviaciones del plan**
- Ninguna / detalle.

**Handoff a la Fase N+1**
- Qué le toca avanzar.
- Qué quedó listo para usar (APIs, tokens, clases, contratos).
- Pendientes / riesgos.
```

---

## Resumen de fases

| Fase | Nombre | Modelo | Estado |
|------|--------|--------|--------|
| 0 | Contexto | Sonnet 5.5 | Completada |
| 1 | Base HTML/CSS (sin 3D) | Opus 5.5 | Completada |
| 2 | Motor 3D y calidad adaptativa | Opus 5.5 | Completada |
| 3 | Planeta del hero | Opus 5.5 (rescate: Opus 5 Thinking High) | Pendiente |
| 4 | Coreografía del scroll | Sonnet 5.5 | Pendiente |
| 5 | CTA y agujero negro | Opus 5.5 (rescate: Opus 5 Thinking High) | Pendiente |
| 6 | UX/UI, microinteracciones y pulido | Sonnet 5.5 | Pendiente |
| 7 | Auditoría de rendimiento | GPT 5.6 | Pendiente |

Decisiones transversales registradas aquí a medida que se toman:

- **Stack:** Vite + TypeScript vanilla, Three.js, GSAP + ScrollTrigger, Lenis. Sin React/R3F, anime.js ni Motion.
- **Color:** paleta del manual de marca (ver `project.mdc`).
- **Tipografía:** display Manrope + Inter en UI pequeña + mono del sistema solo para datos.
- **Estilo del planeta:** obsidiana pulida con rim índigo.
- **Fuente display elegida:** **Manrope** (variable, 600–800). Comparte proporciones con Inter (fuente del logo y de la UI), así que titular y logo no compiten; Sora es más ancha y alarga las líneas en titulares grandes.
- **Fuentes:** woff2 variables, subconjunto latino, autoalojadas en `public/fonts/` (Manrope 24 KB, Inter 48 KB), `font-display: swap` y `preload` en `index.html`. Sin Google Fonts ni paquetes npm de fuentes.
- **Logo en el sitio:** en línea como `<symbol id="zdl-mark">` + `<text>` con Inter autoalojada, porque los SVG de marca tienen el texto como texto editable y dentro de `<img>` no usarían la fuente de la página. Color por variables `--logo-ink`/`--logo-accent` (clases `.logo--light` y `.logo--dark`); la geometría no se toca.
- **Tokens extra para islas oscuras:** `--dark-ink #F7F6FC` (18.6:1), `--dark-muted #B9B9E3` (10.6:1), `--dark-accent #A5A5FF` (9:1) sobre `--space`. `--accent` sobre `--space` da solo ~4:1, así que no se usa para texto pequeño en oscuro.
- **Microinteracciones:** las transiciones quedan para la Fase 6; en la Fase 1 los estados hover son cambios instantáneos de color.
- **Carga del 3D:** `main.ts` (bundle inicial: CSS + GSAP + ScrollTrigger + Lenis, ~51 KB gzip) y `import("./scene")` tras `load` + `requestIdleCallback`. Three.js y todo `src/scene/` salvo `ScrollState`/`PointerState` viven en el chunk diferido `scene-*.js`.
- **Estados en `<html>`:** `.has-webgl` (canvas activo), `.no-webgl` (fallback) y `data-quality="high|medium|low"`. Son el punto de enganche del CSS que dependa del 3D.
- **Un solo rAF por subsistema:** Lenis avanza en `gsap.ticker`; la escena tiene su propio rAF en `SceneManager` (no depende de GSAP).
- **Reduced motion:** sin Lenis (scroll nativo) y la escena con tiempo congelado, renderizando solo al cambiar sección activa, tamaño o calidad. Se lee una vez al cargar.

---

## Fases

### Fase 0 — Contexto · Sonnet 5.5
**Estado:** Completada · 2026-10-01

**Resumen de cambios**
- `.cursor/rules/project.mdc` — regla permanente (`alwaysApply: true`) con el contexto general: qué es el proyecto, secciones, marca y tokens de color, tipografía híbrida, fondo 3D y coreografía, stack cerrado, arquitectura de `src/`, reglas de rendimiento, microinteracciones, convenciones y el protocolo de fases. Los colores salen del manual de marca, no de los prompts genéricos.
- `PHASES.md` — este registro, con protocolo y plantilla.
- `public/brand/` — copia de los 16 SVG de `Zero Day Labs - Marca/svg/` para que el sitio los sirva sin depender de la carpeta de marca.
- `README.md` — cómo correr el proyecto, estructura y notas de rendimiento.

**Desviaciones del plan**
- Se añadió el token `--accent-ink: #3F3FC9`: el acento `#5B5BF0` da ~4:1 sobre `--bg-soft` (`#E8E8FA`) y no pasa AA para texto pequeño. `#3F3FC9` es el color de enlace del propio manual.
- Aún no existe `package.json` ni Vite: el scaffold es parte de la Fase 1, como indica el plan.

**Handoff a la Fase 1**
- Crear el proyecto Vite + TypeScript en esta misma carpeta (sin borrar `Zero Day Labs - Marca/`, `zero-day-labs-prototype-reference.html` ni los `.md`) e instalar `three`, `gsap`, `lenis`.
- Definir `src/styles/tokens.css` con los tokens de `project.mdc`, más escala tipográfica, espaciado, radios y sombras.
- Elegir **Manrope o Sora** para display (y registrarlo arriba en "Fuente display elegida"); autoalojar la fuente y Inter.
- Construir las 9 secciones con copy real en español, componentes reutilizables (botón primario/secundario, tarjeta de vidrio, chip, métrica, paso de proceso), responsive 360–1440 px, foco visible y contraste AA.
- Seguir el prompt 1 de `zero-day-labs-cursor-prompts.md`: entregar primero plan corto (paleta, tipografías, wireframe ASCII) y esperar OK antes de implementar.
- Pendiente menor: los SVG de marca incluyen metadatos C2PA (varios KB cada uno). Limpiarlos al copiarlos a la build del sitio (como mínimo logo horizontal e isotipo) para ahorrar peso.
- Recordar que no hay mockups PNG en el repo.

---

### Fase 1 — Base HTML/CSS (sin 3D) · Opus 5.5
**Estado:** Completada · 2026-10-01

_Alcance:_ scaffold Vite + TS; tokens; 9 secciones con contenido real; componentes; responsive; logo real; contraste AA; foco visible.

**Resumen de cambios**
- `package.json`, `tsconfig.json`, `.gitignore` — scaffold manual de Vite 8 + TypeScript estricto (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`), para no pisar los archivos existentes con el generador. Scripts: `dev`, `build` (`tsc --noEmit && vite build`), `preview`, `typecheck`. Dependencias: `three`, `gsap`, `lenis` (instaladas, **aún sin importar**); dev: `vite`, `typescript`, `@types/three`.
- `index.html` — las 9 secciones con copy real en español, centrado en AR/3D. Un `h1`, `h2` por sección (los pilares usan un `h2` oculto con `.sr-only` y `h3` por pilar), landmarks (`header`, `nav` ×2, `main`, `footer`), skip link, `lang="es"`, meta description/OG y `viewport-fit=cover`. Las métricas van en `<dl>` (dt = etiqueta, dd = valor, invertidos visualmente con `order`) y los pasos del proceso en `<ol>`, porque son una secuencia. El blog usa `<article>` + `<time datetime>`. Sprite SVG en línea con el isotipo de marca y 10 iconos de línea (`#i-*`).
- `src/styles/tokens.css` — `@font-face`, paleta del manual + tokens para islas oscuras, vidrio y líneas; escala tipográfica fluida con `clamp` de 360 a 1440 px (`--fs-display` 40→76 px, `--fs-h2` 32→52, `--fs-h3` 20→24, lead, body, small, label, metric), tracking, `--measure: 62ch`, espaciado base 4 px, `--section-y` y `--gutter` fluidos, radios por jerarquía (chip 999, botón 12, tarjeta 20, panel 32), 2 sombras tintadas de índigo, `--focus-ring`, `--nav-h` y duraciones para la Fase 6.
- `src/styles/base.css` — reset, tipografía base (`text-wrap: balance/pretty`), foco visible global y en oscuro, `.sr-only`, `.skip-link`, `.container`, `.section`, `.eyebrow`, `.lead`, `.mono`, `.section-head` y los componentes reutilizables: `.btn--primary`/`--secondary`/`--sm`, `.glass-card`, `.icon-tile`, `.chip`/`--outline`, `.metric`, `.process-step`. Bloque `prefers-reduced-motion` global.
- `src/styles/sections.css` — layout por sección, móvil primero. Header sticky de vidrio; hero en 1 columna (planeta arriba) y en 2 desde 960 px; pilares en 1, 2 y luego 4 columnas; rejillas de tarjetas (`--4` en 1, 2 y 4 columnas; `--3` en 1, 2 con la última a lo ancho, y 3); "Sobre" con métricas y panel oscuro con retícula AR; proceso como timeline vertical en móvil y horizontal desde 1024 px; proyectos con ilustraciones SVG de línea; chips de áreas; blog; isla oscura con CTA y footer.
- `src/main.ts` — solo importa los tres CSS (Vite los extrae a un `<link>` en el build).
- `public/fonts/` — `manrope-latin-wght.woff2`, `inter-latin-wght.woff2`.
- `public/brand/*.svg` — se quitaron los metadatos C2PA de los 16 SVG (200 KB → 76 KB). Los originales en `Zero Day Labs - Marca/` siguen intactos.
- `public/favicon.svg` — isotipo color fondo claro, limpio.
- `README.md` — comandos reales y carpetas nuevas.

**UX móvil (pedido explícito)**
- En 360×780 el titular, el subtítulo y **los dos botones del hero caben sobre el pliegue** (el último botón termina en y=741). Para lograrlo, el eyebrow se acortó a "Laboratorio de AR y 3D" y el planeta móvil se redujo a `clamp(10rem, 24svh, 18rem)`.
- Todos los enlaces y botones miden **≥ 44 px** de alto (verificado por script de 360 a 1440 px). Sin scroll horizontal en ningún ancho (360, 390, 768, 1024, 1280 y 1440).
- Botones del hero a todo el ancho en <480 px y en línea a partir de ahí; CTA "Hablemos" siempre visible en el header móvil.
- `safe-area-inset` en el header, los laterales del contenedor y el footer; `touch-action: manipulation`; `text-size-adjust: 100%`; color propio para `tap-highlight`; `scroll-padding-top` igual a la altura del nav para las anclas.
- Pilares en lista vertical con el icono a la izquierda (más fácil de escanear que una rejilla 2×2 con palabras largas como "multidisciplinarios").

**Verificación**
- `npm run build` sin errores (incluye `tsc --noEmit`). Peso: HTML 8.5 KB, CSS 4.5 KB y JS 0.4 KB (gzip), más fuentes 72 KB.
- Revisión visual con Edge headless a 360 px (renderizado dentro de un iframe de 360, porque el modo headless no baja de ~500 px de ventana) y a 1440 px.
- Contraste calculado (WCAG): ink/bg 16.2, muted/bg 7.7, muted/bg-soft 6.8, accent-ink/bg 7.1, accent-ink/bg-soft 6.3, accent-ink/accent-soft 6.4, blanco sobre botón 5.0 (hover 7.6), dark-muted/space 10.6, dark-accent/space 9.0. Todos ≥ 4.5.
- Foco: anillo de 2 px `--accent-ink` con separación de 3 px; verificado con `CSS.forcePseudoState` en el botón primario.
- No hay linter configurado en el repo (ni ESLint ni Stylelint); el único chequeo estático es `tsc`.

**Desviaciones del plan**
- **Logo en línea en lugar de `<img>`** (aprobado en el plan): el `src` de `public/brand/logo-horizontal_*.svg` no se usa en el HTML. El texto del logo hereda la Inter autoalojada.
- **Sin menú móvil:** por debajo de 960 px solo se ven el logo y "Hablemos"; los enlaces de sección se ocultan. El menú accesible con JS es de la Fase 6.
- **Marcadores CSS del planeta:** el hero y el panel de "Sobre" llevan un planeta y un anillo hechos con CSS (`.planet-ph`, `aria-hidden`). Reservan el espacio (CLS 0) y dan la composición final mientras no hay 3D. **No es el fallback sin WebGL**: ese sigue siendo `public/fallback/planet.webp` en la Fase 2.
- Se eliminaron los paquetes `@fontsource-variable/*` después de copiar los woff2: con archivos en `public/` se pueden precargar desde `index.html` con una ruta estable.
- Las tarjetas de proyectos y del blog **no son enlaces** (no existen páginas de destino). Así se evitan enlaces muertos.
- La métrica "24/7" quedó como "Experimentos en marcha".

**Handoff a la Fase 2**
- Le toca: `src/scene/` (`SceneManager`, `QualityManager`, `ScrollState`), cableado de Lenis + GSAP ScrollTrigger, el cubo de prueba, la carga diferida tras el primer pintado con fade-in, el fallback sin WebGL (`public/fallback/planet.webp`) y `prefers-reduced-motion`.
- Quedó listo:
  - **IDs de sección** para `ScrollState`: `#inicio`, `#que-hacemos`, `#sobre`, `#proceso`, `#proyectos`, `#areas`, `#blog`, `#contacto`. La isla oscura (CTA + footer) es `.dark-island`.
  - **Áreas reservadas** para el 3D: `.hero__visual` (en escritorio es un cuadrado a la derecha; en móvil va arriba, con 10–18 rem de alto) y `.about__panel` (isla oscura de "Sobre"). Ambas contienen `.planet-ph`, que la Fase 2 debe **ocultar cuando el canvas esté activo** (por ejemplo con una clase `html.has-webgl .planet-ph { visibility: hidden }`) y **conservar o sustituir por el webp** en el fallback.
  - El canvas fijo debe ir detrás del contenido (`z-index` por debajo de `main`; el header es `z-index: 50`). Las tarjetas `.glass-card` ya tienen `backdrop-filter`, así que desenfocarán el planeta al pasar por encima.
  - Tokens de movimiento (`--dur-fast`, `--dur-base`, `--ease-out`) y el bloque de `prefers-reduced-motion` en `base.css`.
  - `main.ts` está vacío salvo los CSS: ahí van el `import()` dinámico de la escena y el arranque de Lenis.
- Pendientes y riesgos:
  - `backdrop-filter` en muchas tarjetas, el header y los botones secundarios puede costar en móviles de gama media cuando haya un canvas animado detrás. Si la Fase 7 lo detecta, bajar o quitar el blur en el nivel de calidad "bajo" (por ejemplo con una clase en `<html>`).
  - Con el canvas detrás, el texto sobre `--bg` debe seguir legible: el planeta no debe pasar por detrás del titular (responsabilidad de las Fases 3–4).
  - El `--dark-line` de la retícula del panel de "Sobre" es decorativo; si el holograma AR de la Fase 4 dibuja su propia malla, quitar la retícula CSS.
- Para fases posteriores (anotado, no implementado):
  - **Fase 4:** la línea guía de `.process__steps::before` es temporal; la órbita SVG con satélite la reemplaza.
  - **Fase 5:** `.cta` tiene `min-height: clamp(30rem, 80svh, 46rem)` como escenario del agujero negro; el texto del CTA ya cumple AA sobre `--space`.
  - **Fase 6:** menú móvil accesible (<960 px), estado activo del nav, transiciones de botones, subrayado animado, contadores, tilt de proyectos y feedback `:active` en táctil. Valorar si las tarjetas del blog y de proyectos necesitan destino real.

---

### Fase 2 — Motor 3D y calidad adaptativa · Opus 5.5
**Estado:** Completada · 2026-10-01

_Alcance:_ `SceneManager`, `QualityManager`, `ScrollState`, cableado Lenis + GSAP, cubo de prueba que reacciona al scroll, init diferido tras primer pintado con fade-in, fallback sin WebGL, `prefers-reduced-motion`.

**Resumen de cambios**
- `src/scene/ScrollState.ts` — objeto único `scrollState` con `page` (0..1), `sections[id]` (0..1 por sección), `active` (índice en `SECTION_IDS`), `velocity` (px/frame de Lenis) y `version` (se incrementa en cada escritura). Se muta en sitio. No importa Three.js, así que vive en el bundle inicial.
- `src/ui/scroll.ts` — **único escritor** de `scrollState`. Lenis (`autoRaf: false`) avanza en `gsap.ticker` y llama a `ScrollTrigger.update`. Crea un ScrollTrigger global, uno por sección para el progreso (`top bottom` → `bottom top`, también en `onRefresh` para fijar 0/1 al cargar) y otro por sección para `active` (`top center` → `bottom center`). Importa `lenis/dist/lenis.css`.
- `src/scene/PointerState.ts` — `pointerState` (-1..1, y hacia arriba) con un listener pasivo, activo solo con `(hover: hover) and (pointer: fine)`; en táctil `enabled` es `false`.
- `src/scene/QualityManager.ts` — niveles `high/medium/low` con `pixelRatio`, `particles` (9000/4000/1500), `dustParticles` (600/300/120), `bloom` (solo alto + escritorio) y `textureSize` (2048/1024/512, tope 1024 en móvil). DPR máximo 2 en escritorio y 1.5 en móvil. Nivel inicial: GPU por software o ≤ 2 núcleos o ≤ 2 GB → bajo; móvil, ≤ 4 núcleos o ≤ 4 GB → medio; si no, alto. Medición: 1 s de calentamiento y ventanas de 2 s; si el promedio es < 50 FPS baja un nivel (nunca sube, para no oscilar). Cada frame pesa como máximo 0.1 s en la media y los huecos > 1 s reinician la medición. `?quality=alto|medio|bajo` fija el nivel.
- `src/scene/SceneManager.ts` — dueño del único canvas y renderer (`alpha`, `antialias` solo en escritorio con DPR < 2, `powerPreference: high-performance`). Cámara de perspectiva (FOV 35, z = 10). Tamaño solo vía `ResizeObserver`. Bucle rAF propio que arma un `FrameContext` reutilizado (`time`, `delta`, `scroll`, `pointer`, `quality`, `reducedMotion`, `viewHalfWidth/Height` del plano z = 0) y llama `update(ctx)` en cada `SceneObject`. Pausas acumulables por motivo (`hidden`, `offscreen`, `context-lost`); `visibilitychange` pausa y reanuda. La pérdida de contexto se trata como definitiva y llama a `onContextLost`. Con reduced motion congela el tiempo y solo renderiza cuando cambia `active`, el tamaño o la calidad.
- `src/scene/objects/TestCube.ts` — **temporal**. Cubo índigo con aristas `--accent`, luces propias. Se mueve con `page`, se reduce con `sections["que-hacemos"]`, se inclina con `velocity` y hace parallax con el puntero (máx. 0.4). Con reduced motion adopta una pose fija por sección activa.
- `src/scene/index.ts` — entrada del chunk diferido: crea `<canvas class="scene-canvas" aria-hidden="true">` al inicio del `body`, monta `SceneManager` + `TestCube` y arranca. Si WebGL falla, quita el canvas y relanza el error.
- `src/main.ts` — `initScroll` inmediato. Tras `load` + `requestIdleCallback` (timeout 2 s): sondeo de WebGL, `import("./scene")`, `data-quality` y fundido GSAP de 0.8 s (canvas 0 → 1, marcador del hero 1 → 0; instantáneo con reduced motion). Ante cualquier fallo, `useFallback()` pone `.no-webgl`, limpia los estilos en línea del marcador y quita el canvas.
- `src/styles/sections.css` — `.scene-canvas` (fijo, `z-index: -1`, `100lvh`, sin eventos, oculto hasta el fundido) y fallback `.no-webgl .hero__visual .planet-ph` con `planet.webp`.
- `public/fallback/planet.webp` — 640×640, 29 KB, fondo transparente, misma composición que el marcador CSS (cuerpo índigo noche, rim índigo, anillo y sombra suave).
- `scripts/fallback-planet.html` + `scripts/make-fallback.mjs` y el script `npm run fallback` — el webp se dibuja en un canvas 2D y se exporta con Edge/Chrome headless. Así es reproducible sin dependencias nuevas.
- `README.md` — comando `fallback`, parámetro `?quality` y carpetas nuevas.

**Verificación**
- `npm run build` sin errores (incluye `tsc --noEmit`); sin errores de lint del IDE en `src/`. Peso gzip: **JS inicial 51.1 KB** (meta < 150), CSS 4.8 KB, HTML 8.5 KB; chunk diferido `scene` 134.6 KB (Three.js). El HTML de producción no precarga el chunk de la escena. Vite avisa que `scene` pasa de 500 KB sin comprimir; es Three.js y se carga diferido.
- Escritorio (1920×1080, DPR 1): `has-webgl` + `lenis`, canvas a pantalla completa, **60 FPS** con el cubo en movimiento, nivel inicial `high`. `scrollState` se actualiza al hacer scroll (`page`, `sections`, `active`) y el cubo se mueve, gira y se reduce. Las `.glass-card` lo desenfocan al pasar por detrás.
- Móvil emulado (390×844, DPR 3, táctil): nivel `medium`, canvas a 585 px de ancho (DPR limitado a 1.5) y el cubo arriba, centrado.
- Reduced motion: el navegador de pruebas tenía el ajuste del sistema activo, así que la primera carga ya entró en ese modo. Sin Lenis y cubo en pose fija por sección (`active = 1` → giro de 45°).
- Sin WebGL (Edge headless con `--disable-3d-apis --disable-webgl` sobre el build): `<html class="no-webgl">`, sin canvas y con el planeta `planet.webp` en el hero.
- Calidad adaptativa con frames sintéticos sobre el `QualityManager` real: a 60 FPS se mantiene en `high`, también con tirones de 300 ms cada 2 s o un hueco de 5 s (vuelta de pestaña). A 40 FPS y a 3 FPS baja de `high` a `medium` y luego a `low`, actualizando DPR, partículas, textura y bloom.
- **Bug encontrado y corregido durante la fase:** la primera versión descartaba todo frame > 250 ms como tirón, así que un dispositivo muy lento nunca bajaba de nivel. Ahora cada frame pesa como máximo 0.1 s en la media.
- **No verificado en navegador:** la pausa con la pestaña oculta (el navegador de pruebas no permite ocultarla; la ruta de código es directa) y la bajada de nivel con CPU 4× real. Con CPU 20–30× más lenta el navegador de pruebas casi no daba frames, así que la medición no era fiable. Queda para la Fase 7 en un dispositivo real.

**Desviaciones del plan**
- **Solo el marcador del hero se oculta** con WebGL activo. El de `.about__panel` sigue siendo CSS, porque el panel es opaco y el canvas fijo queda detrás: hasta la Fase 4 el panel no tiene otro contenido.
- **El fallback `planet.webp` solo se aplica al hero.** El panel de "Sobre" conserva su marcador CSS, que ya está pensado para fondo oscuro.
- **El fallback es un dibujo 2D**, no un render del planeta real, porque el planeta aún no existe. La Fase 3 puede regenerarlo desde su shader.
- **La pérdida de contexto WebGL pasa al fallback de forma definitiva**, sin intentar restaurar: es más simple y no deja la escena a medias.
- Se añadieron `data-quality` en `<html>` y `?quality=` en la URL, que no estaban en el plan: permiten probar los niveles y recortar CSS caro en el nivel bajo (riesgo de `backdrop-filter` anotado en la Fase 1).
- El motivo de pausa `offscreen` existe en la API, pero **nada lo activa todavía**.
- `prefers-reduced-motion` se lee una vez al cargar; un cambio en caliente no reconfigura Lenis (`SceneManager.setReducedMotion` existe por si se quiere enlazar).

**Handoff a la Fase 3**
- Le toca: el planeta del hero según el Prompt 3. Primero 2 variantes de estilo (obsidiana pulida vs. roca lunar) y elegir una; luego shader propio, rim `#5B5BF0`, atmósfera fresnel con blending normal, sombra suave, dos anillos, luna, polvo en GPU, parallax con puntero (no táctil) y posición responsive. Medir el costo en FPS en nivel medio (`?quality=medio`).
- Quedó listo:
  - **Contrato de objeto:** implementar `SceneObject` (`root`, `update(ctx)`, `onResize?(ctx)`, `onQualityChange?(params)`, `dispose()`) y registrarlo con `manager.add(...)` en `src/scene/index.ts`. **Sustituir `TestCube`** (borrar `objects/TestCube.ts` y su `add`). El cubo trae sus propias luces: el planeta necesita las suyas.
  - `ctx.viewHalfWidth/Height` dan el tamaño visible en z = 0 para colocar el planeta "a la derecha en escritorio, arriba en móvil" (ver `TestCube.onResize`, que ya distingue horizontal/vertical). Recalcular solo en `onResize`, nunca leer el DOM en `update`.
  - `ctx.quality.dustParticles` y `ctx.quality.textureSize` para el polvo y las texturas; `onQualityChange` para regenerar si baja el nivel. `ctx.pointer.enabled` es `false` en táctil, así que el parallax queda apagado solo.
  - Con `ctx.reducedMotion` el planeta debe quedar en una pose estática (sin rotación continua, `ctx.time` congelado).
  - `.has-webgl` ya oculta el marcador del hero con fundido; `.no-webgl` muestra `planet.webp`.
- Pendientes / riesgos:
  - Regenerar `public/fallback/planet.webp` para que se parezca al planeta final (`npm run fallback` o un render del shader).
  - El canvas usa `alpha: true` sin `premultipliedAlpha: false`: la atmósfera con blending normal debe escribir alfa premultiplicado correcto o se verán halos oscuros sobre el papel claro.
  - El planeta no debe pasar por detrás del titular (`h1`) en ningún ancho.
- Para fases posteriores (anotado, no implementado):
  - **Fase 4:** `scrollState.sections[id]` va de 0 (la sección entra por abajo) a 1 (sale por arriba); el hero arranca a ~0.5 porque ya está en pantalla. La franja de pilares no tiene `id`: mientras cruza el centro, `active` se queda en 0. El holograma de "Sobre" necesitará que `.about__panel` deje ver el canvas (fondo transparente o un recorte) o dibujar dentro de su rectángulo. Al hacerlo, quitar el marcador CSS del panel.
  - **Fase 5:** `.dark-island` es opaca (`--space`) y tapa el canvas. Habrá que volverla transparente cuando el fondo WebGL oscurezca. El motivo de pausa `offscreen` está disponible si alguna zona no necesita render. `ctx.quality.particles` ya trae 9000/4000/1500 y `ctx.quality.bloom` decide el pase de lente en escritorio.
  - **Fase 6:** Lenis no intercepta anclas (`anchors` sin configurar); el scroll suave de la navegación debe usar `lenis.scrollTo` (`initScroll` devuelve la instancia, hoy no se guarda en `main.ts`).
  - **Fase 7:** probar la bajada de nivel en un móvil real con CPU 4×. Con `html[data-quality="low"]` se puede quitar `backdrop-filter`. El sondeo de WebGL en `main.ts` crea y libera un contexto extra (`WEBGL_lose_context`): medir si cuesta.

---

### Fase 3 — Planeta del hero · Opus 5.5 (rescate: Opus 5 Thinking High)
**Estado:** Pendiente

_Alcance:_ proponer 2 variantes (obsidiana pulida vs roca lunar) y elegir; shader del planeta, rim índigo, atmósfera fresnel con blending normal, sombra suave, dos anillos, luna, polvo en GPU, parallax con puntero (no táctil), posición responsive; medir FPS en nivel medio.

---

### Fase 4 — Coreografía del scroll · Sonnet 5.5
**Estado:** Pendiente

_Alcance:_ planeta recorre la página con scrub; holograma AR en "Sobre"; órbita SVG + satélite en "Proceso"; revelados mínimos; tabla de estados (posición, escala, rotación, inclinación) por sección.

---

### Fase 5 — CTA y agujero negro · Opus 5.5 (rescate: Opus 5 Thinking High)
**Estado:** Pendiente

_Alcance:_ transición claro a oscuro, colapso del planeta, estrellas, agujero negro con disco y lente (partículas 9000/4000/1500), distorsión de pantalla solo en escritorio, legibilidad AA del CTA a media transición.

---

### Fase 6 — UX/UI, microinteracciones y pulido · Sonnet 5.5
**Estado:** Pendiente

_Alcance:_ jerarquía y espaciado en las 9 secciones; microinteracciones; tilt 3D de tarjetas de proyectos; navegación con anclas, estado activo y menú móvil accesible; accesibilidad por teclado; `prefers-reduced-motion` en todo.

---

### Fase 7 — Auditoría de rendimiento · GPT 5.6
**Estado:** Pendiente

_Alcance:_ Lighthouse móvil (Performance, LCP, CLS, TBT); perfilado del render; verificar calidad adaptativa con CPU 4x más lenta; carga diferida, peso de texturas y bundle; reduced-motion y fallback sin WebGL; informe antes/después con números.
