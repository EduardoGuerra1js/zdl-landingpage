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
| 3 | Planeta del hero | Opus 5.5 (rescate: Opus 5 Thinking High) | Completada |
| 4 | Coreografía del scroll | Sonnet 5.5 | Completada |
| 5 | CTA y agujero negro | Opus 5.5 (rescate: Opus 5 Thinking High) | Completada |
| 6 | UX/UI, microinteracciones y pulido | Sonnet 5.5 | Completada |
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
- **Microinteracciones:** `--dur-fast` (150 ms), `--dur-base` (220 ms) y `--ease-out`. Solo `transform` y `opacity`. El cursor magnético es el botón «Ver proyectos» del hero (escritorio, puntero fino). `24/7` no se anima: no es una cuenta.
- **Carga del 3D:** `main.ts` (bundle inicial: CSS + GSAP + ScrollTrigger + Lenis, ~51 KB gzip) y `import("./scene")` tras `load` + `requestIdleCallback`. Three.js y todo `src/scene/` salvo `ScrollState`/`PointerState` viven en el chunk diferido `scene-*.js`.
- **Estados en `<html>`:** `.has-webgl` (canvas activo), `.no-webgl` (fallback) y `data-quality="high|medium|low"`. Son el punto de enganche del CSS que dependa del 3D.
- **Un solo rAF por subsistema:** Lenis avanza en `gsap.ticker`; la escena tiene su propio rAF en `SceneManager` (no depende de GSAP).
- **Reduced motion:** sin Lenis (scroll nativo) y la escena con tiempo congelado, renderizando solo cuando cambian el scroll, el layout, el tamaño o la calidad (desde la Fase 3; antes, solo al cambiar la sección activa). Se lee una vez al cargar.
- **Planeta:** variante **obsidiana pulida** elegida frente a "roca lunar" (la roca gris sobre papel claro tenía poco contraste y necesitaba texturas grandes). La luna sí es de piedra mate, para contrastar materiales.
- **Texturas procedurales horneadas en GPU:** el relieve del planeta se genera una vez en un render target equirectangular (`textureSize × textureSize/2`) con ruido 3D. No hay WebP de textura en el bundle y el costo por frame es cero. Se rehornea solo si baja `textureSize`.
- **GLSL:** archivos `.glsl/.vert/.frag` en `src/scene/shaders/`, importados con `?raw` de Vite (sin plugins). Los colores de los shaders son sRGB directos: los `ShaderMaterial` no incluyen conversión de espacio de color, y las constantes se escriben en GLSL para no pasar por la gestión de color de `THREE.Color`.
- **Alinear 3D con el DOM:** `ui/scroll.ts` mide en cada `refresh` de ScrollTrigger los rectángulos que la escena necesita (`layoutState`, en px de documento) y escribe `scrollState.y`. La escena convierte px a mundo con `FrameContext.viewportWidth/Height`. Nunca mide el DOM en el bucle.
- **Coreografía en una tabla:** todas las poses del planeta por sección están en `src/scene/choreography.ts` (`WIDE` ≥ 1152 px, `NARROW` por debajo). Se ajustan ahí, sin tocar `Planet.ts`. Mezcla lineal en espacio de scroll.
- **Superficies oscuras en WebGL:** el panel de "Sobre" se dibuja en el canvas (`AboutBackdrop`) y su CSS se apaga con `html.scene-ready` (tras el fundido). Sin WebGL, el CSS sigue siendo el fallback.
- **Franjas de vidrio:** pilares y áreas son translúcidas (`rgba(232,232,250,.82)` + blur 18 px) para que el planeta se intuya detrás; en calidad baja, sin blur.
- **Animación por tiempo vs. scroll:** lo atado al scroll es lineal (planeta, órbita del proceso); los momentos que se disparan una vez (entrada del hero, revelados, escaneo AR) usan easing suave. `scrollState.scan` lo escribe `ui/reveals.ts`.
- **Revelados:** opacidad + 12 px, una vez, sin stagger por tarjeta. Con reduced motion no hay revelados y todo aparece en su estado final.
- **Velo anclado a la página, no al tiempo:** el paso de claro a `#07061A` es un degradado vertical dibujado en el canvas (`NightSky`) cuya posición sale del borde superior de `#contacto` menos el scroll. Con WebGL, `.scene-ready .dark-island` es transparente. No hay tween que sincronizar y la legibilidad se puede calcular por posición.
- **Tramo del cierre compartido:** `src/scene/finale.ts` define el tramo de scroll (arranca con el borde de la isla al 72 % del viewport; termina al 85 % del recorrido hasta el final de la página). Lo usan la coreografía del planeta (`target: "finale"`), el agujero negro y, por posición, el cielo.
- **Superficies en el canvas con profundidad:** el velo y las estrellas se dibujan en `z = 0.999/0.998` (fondo del buffer de profundidad) con `depthTest`, para que el cuerpo opaco del planeta no quede tapado. El horizonte del agujero negro es transparente con `depthWrite` para ocultar la mitad trasera del disco.
- **Postprocesado solo cuando hace falta:** `PostPass` en `SceneManager`. `LensPass` (desktop + calidad alta) reserva un render target MSAA ×4 solo mientras el agujero negro está en pantalla; si no, la escena va directo al lienzo y el target se libera.
- **Calidad:** `QualityParams` gana `stars` (700/400/200). `bloom` se documenta como "permite el pase de lente".

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
**Estado:** Completada · 2026-10-01

_Alcance:_ proponer 2 variantes (obsidiana pulida vs roca lunar) y elegir; shader del planeta, rim índigo, atmósfera fresnel con blending normal, sombra suave, dos anillos, luna, polvo en GPU, parallax con puntero (no táctil), posición responsive; medir FPS en nivel medio.

**Variantes**
- **A. Obsidiana pulida (elegida):** cuerpo casi negro índigo, especular nítido y rim `#5B5BF0`. Sobre papel claro funciona como una silueta de alto contraste, y el volumen sale del rim y del brillo, sin blending aditivo.
- **B. Roca lunar:** gris lavanda mate con cráteres. Sobre `#F7F6FC` el contraste es bajo, el rim casi no se distingue y el relieve pide texturas grandes. Se descartó; su material quedó para la luna.

**Resumen de cambios**
- `src/scene/objects/Planet.ts` — `SceneObject` del planeta, todo en unidades de radio y con `root` escalado al radio en mundo. Lo componen el cuerpo (esfera 96×64 con eje inclinado 0.32 rad, giro 0.045 rad/s), la atmósfera (esfera 1.14 en `BackSide`), la sombra, una banda translúcida (radios 1.22–1.5), un anillo de línea (1.62), la luna (radio 0.09, órbita 1.82 a 0.11 rad/s) y el polvo. Los anillos van inclinados casi de canto, con la mitad inferior por delante, igual que el marcador CSS; el buffer de profundidad oculta lo que pasa detrás del cuerpo. Parallax con el puntero: 0.25 unidades de desplazamiento más 0.08 rad de giro en los anillos, amortiguado y apagado en táctil y con reduced motion. Se oculta (`visible = false`) cuando sale por arriba del viewport.
- `src/scene/objects/Dust.ts` — `Points` con atributos estáticos (`aOrbit`: radio, fase, altura, velocidad; `aLook`: tamaño en px y tono). El buffer se reserva una vez para 600 partículas y la calidad solo cambia `setDrawRange` (600/300/120), así que no realoca. PRNG determinista. Disco inclinado como la banda, más un 25 % en cáscara.
- `src/scene/textures/bakePlanetTexture.ts` — un pase a un `WebGLRenderTarget` equirectangular con mipmaps, `RepeatWrapping` horizontal y anisotropía ≤ 4. RGB es la normal en espacio de objeto con el relieve aplicado y A es la máscara de vetas.
- `src/scene/shaders/` — `noise.glsl` (simplex 3D de Ashima/Gustavson, MIT, y fbm de 4 octavas), `fullscreen.vert` + `bake.frag` (fbm suave, vetas con ridged noise y micro-relieve; la normal se obtiene por diferencias finitas en 3D, sin costura ni pellizco en los polos), `surface.vert` (compartido), `planet.frag` (difuso envolvente, especular nítido con normal casi lisa más un brillo amplio, reflejo tenue del papel en el borde superior y rim índigo en el lado opuesto a la luz), `atmosphere.frag` (el alfa cae del borde del cuerpo hacia fuera según la distancia proyectada, con algo más de peso en el lado del rim), `ring.vert/.frag` (modo banda con estrías y modo línea de ~1.5 px de pantalla con `fwidth`), `moon.frag` (mate, sin especular), `shadow.frag` (gaussiana índigo noche) y `dust.vert/.frag`.
- `src/scene/LayoutState.ts` — **nuevo**, `layoutState.hero` (centro y lado de `.hero__visual .planet-ph` en px de documento) con `version`. Bundle inicial, sin Three.js.
- `src/scene/ScrollState.ts` — nuevo campo `y` (px de scroll).
- `src/ui/scroll.ts` — también escribe `scrollState.y` (desde Lenis y desde el ScrollTrigger global) y mide `layoutState.hero` en cada `refresh` de ScrollTrigger (carga, resize) y al iniciar.
- `src/scene/SceneManager.ts` — `FrameContext` gana `layout`, `viewportWidth` y `viewportHeight` (px CSS del canvas); `SceneManagerOptions` gana `layout`. Con reduced motion renderiza cuando cambian `scroll.version` o `layout.version` (antes, solo al cambiar `active`), para que el planeta acompañe al scroll como una imagen fija.
- `src/scene/index.ts` — registra `Planet` en lugar del cubo. **Se borró `objects/TestCube.ts`.**
- `scripts/fallback-planet.html` + `public/fallback/planet.webp` — el dibujo 2D imita la pose final: sombra, banda y línea por detrás y por delante, halo, cuerpo de obsidiana con brillo y rim, y luna. 640×640, 48 KB (antes 29 KB; solo se descarga sin WebGL).
- `README.md` — carpetas `LayoutState` y `textures/`.

**Verificación**
- `npm run build` sin errores (incluye `tsc --noEmit`); sin errores de lint del IDE en `src/`. Peso gzip: **JS inicial 51.2 KB** (sin cambio), CSS 4.8 KB; chunk diferido `scene` **138.2 KB** (antes 134.6: el planeta y los shaders suman ~3.6 KB). El HTML no precarga el chunk de la escena.
- FPS en escritorio (1660×916, DPR 1), con reduced motion desactivado por emulación porque el sistema de pruebas lo tiene activo: **`?quality=medio` 60 FPS (p95 16.8 ms)**, **medio con CPU 4× más lenta 60 FPS (p95 16.8 ms)** y **`?quality=alto` 60 FPS (p95 16.8 ms)**. Sin tareas largas (> 50 ms) al cargar, incluido el horneado de 2048×1024.
- Alineación: el centro del planeta coincide con el de `.planet-ph` (1163, 463 px) y sube con el hero al hacer scroll (con `scrollTo(0, 350)` el centro pasa a y=113 y el planeta lo sigue).
- Responsive: 360×780 (DPR 3, táctil → nivel medio, canvas a DPR 1.5): el planeta va en la franja superior y el marcador termina en y=268, antes del eyebrow y del `h1` (y=327). 768: arriba, centrado. 1024 y 1440: columna derecha, sin tocar el titular ni el subtítulo (por eso se redujeron la órbita de la luna, de 1.95 a 1.82, y el radio del polvo, de 2.1 a 1.95).
- Alfa sobre papel: sin halos oscuros en el borde de la atmósfera ni en los anillos (shaders sin premultiplicar + `NormalBlending` sobre clear transparente).
- Reduced motion: sin Lenis, pose fija (sin giro, luna ni polvo en movimiento) y el planeta acompaña al scroll nativo.
- Sin WebGL (simulado quitando el canvas y poniendo `.no-webgl`): el hero muestra el nuevo `planet.webp`.
- **No verificado:** el parallax con un puntero real (el navegador de pruebas no mueve el ratón; el código es directo) y el rendimiento en un móvil real.

**Desviaciones del plan**
- **El planeta se ancla al marcador del DOM** con `layoutState` en lugar de una posición fija en mundo: así el fundido de la Fase 2 coincide con el marcador CSS y el planeta sube con el hero. Mientras no llegue la Fase 4, al bajar del hero el planeta sale por arriba y se oculta; el resto de la página queda sin 3D.
- **Extensiones al motor de la Fase 2** (no se reabrió): `layout` y `viewportWidth/Height` en `FrameContext`, y el criterio de re-render con reduced motion.
- **Sombra "proyectada sobre la página"**: es una mancha gaussiana en el canvas, detrás y debajo del cuerpo. El canvas no puede dibujar sobre el DOM.
- **Anillo de línea con `fwidth`** sobre un `RingGeometry` ancho, porque `linewidth` no funciona en WebGL. El grosor queda en ~1.5 px de pantalla a cualquier tamaño.
- **Parallax de 0.25 unidades** (menos que el máximo de 0.4) más 0.08 rad de giro de los anillos, para que se sienta en capas y no como un objeto que se desliza.
- El `planet.webp` creció a 48 KB por el halo y la sombra suaves.

**Handoff a la Fase 4**
- Le toca: la coreografía del Prompt 4. El planeta recorre la página con scrub lineal (posición, escala, rotación, inclinación de anillos) sin tapar texto; el holograma AR en "Sobre"; la órbita SVG con satélite en "Proceso"; la secuencia de entrada del hero y los revelados mínimos; la tabla de estados por sección.
- Quedó listo:
  - **`Planet.update(ctx)`** calcula la pose "home" del hero a partir de `ctx.layout.hero` + `ctx.scroll.y` (`x`, `y`, `radius`). La coreografía debería mezclar esa pose con objetivos por sección según `ctx.scroll.sections[id]` (lineal). Los grupos que se pueden animar son `root` (posición y escala), `spin` (inclinación del eje), `body.rotation.y` (giro), `rings` (inclinación conjunta; cada anillo tiene su `pivot` con `rotation.z` y su malla con `rotation.x`) y `moonSpin`.
  - **`layoutState`** se puede ampliar con más rectángulos (por ejemplo `.about__panel` para el holograma o los márgenes libres de cada sección): se añade el campo en `LayoutData` y se mide en `measure()` de `ui/scroll.ts`.
  - Hoy `root.visible` se apaga cuando el planeta sale por arriba; la Fase 4 debe reemplazar esa condición cuando el planeta viaje por la página.
  - `uOpacity` de la atmósfera, los anillos, la sombra y el polvo son uniforms por material: sirven para atenuar capas por sección (por ejemplo, en el holograma).
  - El mapa horneado (`uMap`) trae la máscara de vetas en el canal A; el holograma puede reutilizarlo para la malla o la línea de escaneo sin otra textura.
- Pendientes / riesgos:
  - **La franja de pilares y otras secciones tienen fondo opaco** (`--bg-soft`), así que el canvas no se ve detrás. Si el planeta debe cruzarlas, hay que hacerlas translúcidas o mantenerlo en los márgenes.
  - El `header` de vidrio desenfoca el planeta al pasar por debajo; se ve bien, pero cuesta `backdrop-filter` con el canvas animado (riesgo de la Fase 1).
  - Al rehornear la textura en `onQualityChange` (2048 → 1024 → 512) puede haber un tirón de un frame; solo pasa al bajar de nivel.
  - El holograma de "Sobre" sigue necesitando que `.about__panel` deje ver el canvas (es opaco). Al hacerlo, quitar la retícula CSS y el marcador `.planet-ph--panel`.
- Para fases posteriores (anotado, no implementado):
  - **Fase 5:** el colapso del planeta puede animar `root.scale` y los `uOpacity`. El canvas sigue sin `offscreen`; cuando el planeta no se ve y aún no hay agujero negro, se renderiza un frame vacío (barato, pero se puede pausar).
  - **Fase 7:** medir el horneado de 2048×1024 en GPU integradas y el costo de `backdrop-filter` del header con el planeta debajo. Comprobar el parallax con un ratón real.

---

### Fase 4 — Coreografía del scroll · Sonnet 5.5
**Estado:** Completada · 2026-10-01

_Alcance:_ planeta recorre la página con scrub; holograma AR en "Sobre"; órbita SVG + satélite en "Proceso"; revelados mínimos; tabla de estados (posición, escala, rotación, inclinación) por sección.

**Decisiones previas (consultadas al usuario)**
- **Holograma con el panel dibujado en WebGL:** el fondo oscuro de `.about__panel` se pinta en el canvas (mismo rectángulo, radio, retícula y sombra que el CSS), y el CSS del panel se vuelve transparente. Así el planeta y el holograma viven "dentro" del panel sin recortes del DOM.
- **Franjas de vidrio:** pilares y áreas pasan de `--bg-soft` opaco a vidrio translúcido, para que el planeta se intuya al cruzarlas.

**Resumen de cambios**
- `src/scene/choreography.ts` — **nuevo**. Contiene la tabla de poses ajustable y la clase `Choreography`.
  - Cada clave (`KeySpec`) apunta a una sección (o al panel `about`) y a un progreso `t`, con la semántica de `scrollState.sections`: 0 cuando la sección entra por abajo y 1 cuando sale por arriba.
  - La pose (`PoseSpec`) tiene: ancla, `x`/`y`, radio `r`, inclinación del eje, inclinación y alabeo de los anillos, giro acumulado, sombra, polvo y `panel`.
  - Anclas:
    - `hero` y `about` van pegadas al rectángulo del DOM y suben con el scroll.
    - `view` es una posición fija en pantalla (`x`/`y` en 0..1 del viewport, `r` en fracción del lado menor).
    - `follow: false` toma la posición del ancla en esa clave y la deja fija en pantalla. Así, en escritorio, el planeta del hero no se mete bajo el header.
  - Entre claves la mezcla es **lineal en espacio de scroll**, sin easing (regla del scrub).
  - Regla de radio cero: si cambia el ancla y un extremo tiene `r = 0`, el planeta crece o se encoge en el sitio del otro extremo, sin viajar.
  - `build()` convierte las claves a px de scroll solo cuando cambian el layout o el tamaño, y las fuerza a ser monótonas y ≤ `scrollMax`. `sample()` escribe en `Float32Array` reutilizados, con cero asignaciones por frame.
  - Con reduced motion se usa la pose de reposo (`rest`) de la sección activa.
  - Hay dos tablas: `WIDE` desde 1152 px y `NARROW` por debajo (ver la tabla de estados).
- `src/scene/objects/Planet.ts`
  - Lee la pose de `Choreography` en vez de calcular su pose home: `root` (posición y escala), `spin.rotation.z` (eje), `body.rotation.y` (giro acumulado más el giro continuo) y `rings.rotation` (inclinación y alabeo más el parallax).
  - Visible solo si la pose está lista, `r > 0` y está en pantalla.
  - El parallax baja un 70 % dentro del panel.
  - Uniforms nuevos: `uShadow` (sombra por sección), `uEnv` (apaga el reflejo del papel dentro del panel oscuro), `uPanel` y `uScan` (holograma).
  - `createHologram()` crea una esfera hija del cuerpo, de radio 1.012, con blending aditivo (aquí luce porque está sobre el panel oscuro) y `depthWrite: false`.
- `src/scene/objects/AboutBackdrop.ts` + `src/scene/shaders/panel.frag` — **nuevo**. Dibuja el fondo del panel de "Sobre" en el canvas:
  - un plano a z = −6, escalado por perspectiva para medir lo mismo que el rectángulo del DOM;
  - SDF de rectángulo redondeado (radio 32 px), retícula de 40 px y sombra exterior suave;
  - `renderOrder −1`; el cuerpo opaco del planeta lo tapa por profundidad.
  
  Se registra antes de `Planet` en `src/scene/index.ts`.
- `src/scene/shaders/hologram.frag` — **nuevo**. Malla de meridianos y paralelos (24×12, con `fwidth`) más curvas de nivel sacadas de la máscara de vetas de `uMap.a`; no carga texturas nuevas.
  - Una línea de escaneo baja de polo a polo con `uScan`: la malla aparece detrás de la línea con un brillo extra que se asienta al terminar.
  - Color `--dark-accent` (`#A5A5FF`); se descarta si `uPanel` o `uScan` son ~0.
- `src/scene/shaders/planet.frag` — el reflejo del papel se multiplica por `uEnv`.
- `src/scene/objects/Dust.ts` — `uOpacity` por sección (`update(time, fade)`).
- `src/scene/SceneManager.ts` — exporta `CAMERA_Z` (lo usa `AboutBackdrop` para la escala por profundidad).
- `src/scene/LayoutState.ts` — `layoutState` ahora tiene `hero` y `about` (`Rect` con `width`/`height`), `sections[id]` (`top` y `height`), `viewportHeight` y `scrollMax`.
- `src/scene/ScrollState.ts` — nuevo campo `scan` (0..1, progreso del escaneo AR). Lo escribe `ui/reveals.ts`; el contrato queda documentado.
- `src/ui/scroll.ts`
  - `measure()` rellena los campos nuevos de `layoutState`.
  - **`refreshOnReflow()` (bug latente de la Fase 2):** un `ResizeObserver` sobre `body` llama a `ScrollTrigger.refresh()` (como mucho una vez por frame) cuando cambia la altura del documento o el ancho del cliente. También refresca en `document.fonts.ready`. Antes, si la página cambiaba de alto sin cambiar el viewport (fuentes, reflujo), las posiciones de ScrollTrigger y de `layoutState` quedaban viejas, y el planeta se desalineaba del panel.
- `src/ui/reveals.ts` — **nuevo**.
  - Una sola secuencia de entrada del hero (eyebrow, `h1`, subtítulo y botones): opacidad 0.01 → 1 y 12 px, 0.7 s, desfase 0.09 s.
  - Revelados mínimos de bloque (`[data-reveal]`: opacidad + 12 px, 0.6 s, una vez, **sin stagger por tarjeta**); se omiten los que ya están en pantalla al cargar.
  - El escaneo AR (`scrollState.scan` 0 → 1 en 2.4 s, una vez, cuando el panel cruza el 62 % del viewport).
- `src/ui/process.ts` — **nuevo**. Órbita SVG del proceso:
  - En cada `refresh` mide los centros de los 4 índices y arma una curva cuadrática por tramo: arco hacia arriba en fila (escritorio) y hacia la izquierda en columna (móvil).
  - Calcula la longitud acumulada hasta cada paso.
  - Un ScrollTrigger lineal (scrub) dibuja el trazo (`stroke-dashoffset`) y mueve el satélite con `getPointAtLength`, sin MotionPathPlugin.
  - Cada paso alcanzado recibe `.is-reached`; la clase solo se toca cuando cambia el conteo.
  - Con reduced motion, la órbita aparece completa.
- `src/main.ts` — llama a `initProcessOrbit` e `initReveals`. Al terminar el fundido del canvas añade `.scene-ready`; el fallback la quita.
- `index.html`
  - Script en línea que añade `.js` a `<html>`.
  - Atributos `data-hero-reveal` y `data-reveal`.
  - `.process__track` envuelve el `<ol>` del proceso y el nuevo `<svg class="process__orbit">` (trazo guía, trazo recorrido y satélite).
- `src/styles/sections.css`
  - `.scene-ready .about__panel` sin fondo ni sombra, y el marcador `.planet-ph--panel` oculto.
  - Franjas de vidrio: `rgba(232,232,250,.82)` + `blur(18px)`, contraste ≥ 4.7:1 en el peor caso; en `data-quality="low"`, sin blur y con alfa 0.95.
  - Estilos de la órbita y de `.is-reached`.
  - Se quitó la línea guía `.process__steps::before`.
- `src/styles/base.css` — estado inicial del hero (`.js [data-hero-reveal]`, opacidad 0.01) con una animación CSS de respaldo a los 3 s, por si el JS no llega. Solo aplica con `prefers-reduced-motion: no-preference`.

**Tabla de estados**

Escritorio ancho (≥ 1152 px). `x`/`y` en fracción del viewport y `r` en fracción del lado menor; los ángulos en radianes. Las claves están en el progreso de la sección indicado.

| Sección (clave) | Ancla / posición | Escala `r` | Eje | Anillos (incl. / alabeo) | Giro | Sombra / polvo | Momento |
|---|---|---|---|---|---|---|---|
| Hero (inicio) | marcador del hero, fijo en pantalla | 1 (marcador) | 0.32 | 0 / 0 | 0 | 1 / 1 | entrada orquestada |
| Qué hacemos (0.5) | view 0.55, 0.30 | 0.55 | 0.45 | 0.25 / 0 | 0.8 | 0.6 / 0.6 | se desplaza y reduce, parallax |
| Sobre (0.4 → 0.62) | dentro del panel | 1 (panel) | 0.20 | −0.10 / 0 | 1.6 → 1.9 | 0 / 0.7 | holograma + escaneo |
| Proceso (0.5) | view 0.62, 0.42 | 0.40 | 0.50 | 0.35 / −0.10 | 2.4 | 0.5 / 0.5 | órbita SVG + satélite |
| Proyectos (0.5) | view 0.60, 0.45 | 0.45 | 0.25 | 0.05 / 0.08 | 3.0 | 0.5 / 0.5 | (tilt de tarjetas: Fase 6) |
| Áreas (0.5) | view 0.62, 0.68 | 0.32 | 0.40 | 0.30 / 0 | 3.4 | 0.4 / 0.4 | discreto, tras el vidrio |
| Blog (0.5) | view 0.60, 0.42 | 0.45 | 0.35 | 0.15 / 0 | 3.8 | 0.5 / 0.5 | discreto |
| Contacto (0.3) | igual que blog | 0.45 | 0.35 | 0.15 / 0 | 4.0 | 0.5 / 0.5 | punto de partida del colapso (Fase 5) |

Estrecho (< 1152 px: móvil, tablet y escritorio estrecho, donde las rejillas ocupan todo el ancho):
1. El planeta nace en el marcador del hero (`r` 1) y, pegado a él, se encoge hasta 0 en el 70 % del hero.
2. Desaparece hasta "Sobre": crece dentro del panel entre el 12 % y el 35 %, se queda allí hasta el 65 % y se encoge al 88 %.
3. En el resto de secciones queda en `r` 0 (sin sombra ni polvo) y el giro sigue acumulándose: 0.8, 1.2, 2.4, 3, 3.4, 3.8 y 4.

**Verificación**
- `npm run build` sin errores (incluye `tsc --noEmit`) y sin errores de lint del IDE en `src/` ni `index.html`. Peso gzip: **JS inicial 52.4 KB** (antes 51.2; reveals y órbita), CSS 5.0 KB, chunk `scene` **141.5 KB** (antes 138.2; coreografía, panel y holograma).
- FPS en escritorio (1660×916, DPR 1), recorriendo toda la página: **`?quality=medio` 60 FPS (p95 16.8 ms)** y **60 FPS también con CPU 4× más lenta**.
- Revisión visual:
  - 1660×916: hero, pilares de vidrio, "Qué hacemos" (planeta en el margen derecho), panel de "Sobre" (el fondo WebGL coincide con el CSS) con el escaneo a medio camino y al terminar, órbita del proceso con el satélite, proyectos, áreas y blog.
  - 1024×768: tabla estrecha; el planeta se encoge con el hero y crece en el panel.
  - 360×780 (táctil, nivel medio): hero, panel y órbita vertical.
- Reduced motion: `h1` con opacidad 1, ningún bloque oculto, los 4 pasos alcanzados y el planeta en su pose del panel. Esto llevó a encontrar el bug de `refreshOnReflow`.
- Sin WebGL (simulado): el panel vuelve a su fondo CSS, con retícula y marcador; el hero muestra `planet.webp`.
- **No verificado:** el parallax con un ratón real, un móvil real y el LCP medido con Lighthouse (el hero arranca a opacidad 0.01).

**Desviaciones del plan**
- **El planeta no pasa por detrás de las tarjetas.** En proyectos y blog, el planeta desenfocado tras el vidrio quedaba como una mancha gris bajo el texto, así que en cada sección vive en el margen superior derecho, junto al encabezado. Solo cruza tarjetas en las transiciones entre secciones.
- **Por debajo de 1152 px el planeta solo aparece en el hero y en el panel.** No hay margen libre cuando las rejillas ocupan todo el ancho; a 1024 px la rejilla 2×2 de "Qué hacemos" quedaba bajo el planeta. El umbral coincide con el `72rem` de `.cards-grid--4`.
- **Clase nueva `.scene-ready`** en `<html>` (tras el fundido del canvas): el CSS del panel se apaga solo cuando el fondo WebGL ya se ve, sin parpadeo.
- **Arreglo en `ui/scroll.ts` (Fase 2):** `refreshOnReflow`, necesario para que la coreografía no se desalineara. No se reabrió la fase; es un arreglo de un bug que bloqueaba esta.
- **El hero arranca a opacidad 0.01, no 0,** para que el navegador cuente el `h1` como candidato a LCP desde el primer pintado. Tiene un respaldo CSS a los 3 s.
- **Marcado del proceso:** el `<ol>` va dentro de `.process__track`, junto al SVG. Sin JS no hay línea guía (antes la dibujaba el CSS); los pasos siguen numerados.
- **Escaneo AR por tiempo, no por scroll:** dura 2.4 s y se dispara una vez al llegar al panel. Un escaneo atado al scroll se veía a tirones al parar.

**Handoff a la Fase 5**
- Le toca: la transición claro → oscuro, el colapso del planeta, las estrellas y el agujero negro con disco y lente en la isla final.
- Quedó listo:
  - **Pose de partida:** la última clave (`contacto`, t 0.3) deja el planeta en view 0.60, 0.42, con `r` 0.45 en ancho; en estrecho está oculto (`r` 0). El colapso puede añadirse como claves nuevas al final de `WIDE`/`NARROW` en `choreography.ts`, por ejemplo `r` → 0 con el ancla `view`, o leerse aparte con `scrollState.sections.contacto`.
  - `Planet` expone por uniform la opacidad de la atmósfera, los anillos, la sombra (`uShadow`) y el polvo (`Dust.update(time, fade)`); `root.scale` es el radio en mundo.
  - **`AboutBackdrop` es el patrón para dibujar en WebGL superficies oscuras que coinciden con el DOM** (plano a profundidad fija escalado con `CAMERA_Z`, SDF de rectángulo redondeado). Sirve para la isla oscura si conviene que el oscurecimiento viva en el canvas.
  - `layoutState.sections.contacto` (`top`, `height`) y `layoutState.scrollMax` ya se miden.
- Pendientes / riesgos:
  - `.dark-island` sigue opaca (`--space`) y tapa el canvas: hay que volverla transparente (con un patrón tipo `.scene-ready`) cuando el fondo WebGL oscurezca.
  - El holograma usa blending aditivo dentro del panel; el agujero negro puede reutilizar el mismo criterio sobre la isla oscura.
- Para fases posteriores (anotado, no implementado):
  - **Fase 6:** transición de `.process-step.is-reached` (hoy instantánea); tilt de tarjetas de proyectos (la pose de proyectos deja libre el área de las tarjetas); anclas con `lenis.scrollTo`; revisar que la secuencia del hero no retrase el LCP. Si se cambian alturas de sección, `refreshOnReflow` ya re-mide solo.
  - **Fase 7:** costo de `backdrop-filter` en las franjas de vidrio con el canvas animado detrás (en nivel bajo ya se quita el blur); costo de `ScrollTrigger.refresh()` al reflujar (como mucho uno por frame); LCP con el hero a opacidad 0.01.

---

### Fase 5 — CTA y agujero negro · Opus 5.5 (rescate: Opus 5 Thinking High)
**Estado:** Completada · 2026-10-02

_Alcance:_ transición claro a oscuro, colapso del planeta, estrellas, agujero negro con disco y lente (partículas 9000/4000/1500), distorsión de pantalla solo en escritorio, legibilidad AA del CTA a media transición.

**Resumen de cambios**
- `src/scene/finale.ts` — **nuevo**. `finaleStart/Span/Progress(layout, scrollY)` y `smoothstep`. Un solo tramo de scroll para planeta, agujero negro y cielo.
- `src/scene/objects/NightSky.ts` + `shaders/veil.vert|frag`, `stars.vert|frag` — **nuevo**.
  - **Velo:** un cuadro a pantalla completa en el fondo del buffer de profundidad. El alfa es `smoothstep` en función del y de pantalla, con rampa de 0.05 vh antes del borde de la isla a 0.20 vh después, más ruido de ±0.5/255 contra bandas.
  - **Estrellas:** 700/400/200 `Points` en NDC con parallax por scroll (10 % del contenido, según una "profundidad" por estrella) y parpadeo en el vertex shader. Solo se ven donde el velo ya es oscuro.
  - Todo el trabajo va en la GPU; el buffer se reserva una vez y la calidad solo mueve `drawRange`. Se oculta (`visible = false`) cuando la rampa aún no entra en pantalla.
- `src/scene/objects/BlackHole.ts` + `shaders/blackhole.glsl`, `bh-particles.vert|frag`, `bh-disc.frag`, `bh-lens.frag`, `bh-horizon.frag` — **nuevo**.
  - **Horizonte** negro (disco SDF) que escribe profundidad y oculta la mitad trasera del disco.
  - **Disco de acreción:** `quality.particles` puntos (9000/4000/1500). Radio, fase, grosor y semilla son atributos estáticos; el vertex shader calcula ángulo con rotación diferencial kepleriana (`ω ∝ r^-1.5`: el interior gira ~4.7× más rápido que el borde), inclinación de 78°, color (blanco cálido → naranja → magenta → índigo `#5B5BF0`), efecto Doppler (el lado que se acerca brilla más) y parpadeo.
  - **Cuerpo continuo del disco:** un quad inclinado con estrías procedurales que se enroscan con la misma `ω(r)`, para que no parezca polvo suelto.
  - **Lente gravitacional barata:** un quad de cara a la cámara con el arco sobre el horizonte, el anillo de fotones y el halo, más una segunda pasada de partículas (la mitad, comparten buffer) con la imagen "lensada" del disco.
  - Aparece con `smoothstep(0.05, 0.5, finaleProgress)`. Escribe `LensState`. Cero asignaciones por frame.
- `src/scene/post/LensPass.ts` + `shaders/lens.frag` — **nuevo**. Pase único de pantalla completa que empuja la imagen hacia fuera del agujero (siempre muestrea más cerca del centro, así no sale del lienzo). Solo con `quality.bloom` (escritorio + alto). Render target RGBA MSAA ×4 creado solo mientras el pase está activo y liberado al salir.
- `src/scene/SceneManager.ts` — interfaz `PostPass` y opción `post`: si `post.active` el pase dibuja la escena; si no, dibujo directo y `release()`. `onQualityChange` y `dispose` se propagan al pase.
- `src/scene/choreography.ts` — ancla nueva `cta`, destino `finale` (fracción del tramo del cierre) y `travel` en una clave (cambia de ancla viajando, sin la regla de radio cero). En ancho, `contacto 0.3` se sustituye por: `finale 0` (pose del margen), `finale 0.5` (`cta`, r = 0, giro 7, sin sombra ni polvo) y `finale 1` (reposo). El planeta cae hacia el agujero y desaparece justo cuando éste termina de formarse. En estrecho el planeta sigue oculto (`finale 0.5`, reposo).
- `src/scene/LayoutState.ts`, `src/ui/scroll.ts` — `layoutState.cta` (rectángulo de `.cta__visual`), medido en cada `refresh`.
- `src/scene/QualityManager.ts` — `stars` en los presets.
- `src/scene/random.ts` — **nuevo**: `mulberry32` compartido (`Dust`, `NightSky`, `BlackHole`); se quitó la copia de `Dust.ts`.
- `src/scene/index.ts` — registra `NightSky`, `Planet`, `BlackHole` y el `LensPass`.
- `index.html` — el CTA pasa a `.cta__layout` con `.cta__visual` (escenario del agujero negro, con `.bh-ph` de respaldo) y `.cta__inner`.
- `src/styles/sections.css`
  - CTA en dos columnas desde 60 rem (texto a la izquierda, agujero negro a la derecha, 5:4) y apilado en móvil (agujero negro arriba, texto centrado debajo).
  - `padding-top: max(6rem, 22svh)`: el primer texto empieza siempre por debajo de donde el velo ya es opaco.
  - `.scene-ready .dark-island` transparente y sin radios (el fondo lo pone el velo).
  - `.bh-ph`: respaldo CSS sin WebGL (horizonte, anillo de luz y disco de canto), oculto con `.has-webgl`.

**Verificación**
- `npm run build` sin errores (incluye `tsc --noEmit`). Peso gzip: **JS inicial 52.45 KB** (antes 52.4; solo cambia `layoutState`), CSS 5.24 KB, chunk `scene` **146.1 KB** (antes 141.5; cielo, agujero negro y lente suman ~4.6 KB).
- FPS en escritorio (1440×900, DPR 1, `?quality=alto`, con el pase de lente activo): **60 FPS (p95 16.8 ms)** con el agujero negro completo y **60 FPS con CPU 4× más lenta** a mitad de la transición. `?quality=bajo` (1500 partículas, sin lente): 60 FPS.
- Revisión visual en 1440×900: inicio de la transición (borde de la isla al 71 % del viewport), punto medio (55 %), tramo final (37 %) y reposo al final del scroll. El degradado de papel a `#07061A` es continuo, las estrellas aparecen dentro de lo oscuro y el planeta cae al agujero negro con sus anillos hasta desaparecer.
- **Punto medio de la transición (pedido del Prompt 5):** con el borde de la isla al 55 % del viewport, la mitad superior sigue siendo papel con la parte baja de las tarjetas del blog; justo debajo hay una franja de ~0.25 vh con el degradado y, bajo ella, el cielo ya plenamente oscuro con estrellas. El planeta (pequeño, con sus anillos) está a medio caer hacia el agujero negro, que aparece parcialmente en la columna derecha, y empiezan a verse el eyebrow y el titular del CTA ya sobre fondo oscuro. Las tarjetas del blog terminan ≥ 72 px antes del borde de la isla y la rampa empieza 0.05 vh antes, así que ningún texto del blog queda sobre el degradado.
- **Legibilidad AA (calculada por posición, WCAG):** como el velo depende solo de la posición, el contraste de cada texto es constante con el scroll. En 1280×600 (el peor caso: el texto más cerca del borde) y en 360 px de ancho, eyebrow (`#A5A5FF`) 9:1, titular 18.6:1, subtítulo (`#B9B9E3`) 10.6:1 y botón 20:1. El texto más alto del CTA queda a 0.30 vh del borde (en 1280×600) y el velo ya es 100 % opaco a 0.20 vh.
- Reduced motion: sin Lenis, agujero negro estático al llegar al CTA y planeta ya ausente. Sin WebGL (simulado): la isla vuelve a su fondo `--space` con esquinas redondeadas y se ve el respaldo CSS.
- Móvil emulado (374×811 reales de la pestaña, DPR 3, táctil, nivel medio): el agujero negro entra bajo el degradado, sin pase de lente, y el texto del CTA queda legible. Sin scroll horizontal.
- **No verificado:** un móvil real, la distorsión de lente con una GPU integrada (en esta máquina cuesta 0 ms visibles), el parallax de estrellas con Lenis a velocidad alta y LCP con Lighthouse. Tampoco puedo afirmar el "look" fino del disco (proporciones y color) más allá de las capturas; conviene que lo revises a mano.

**Desviaciones del plan**
- **En móvil y tablet estrecha el agujero negro no está en pantalla en el reposo final.** El CTA apila agujero negro + texto + pie de página, y con el pie de ~250 px el agujero negro queda justo encima del viewport al llegar al final. Se ve al atravesar la sección, pero al llegar al fondo solo queda el texto, que es lo que más importa. No se puede encajar todo en 360×780 sin recortar el pie, que es trabajo de la Fase 6.
- **El planeta no colapsa en móvil / escritorio estrecho (< 1152 px):** allí ya estaba oculto desde la Fase 4, así que solo "aparece" el agujero negro.
- **Sin distorsión de pantalla en móvil ni en nivel medio/bajo** (según el prompt). El halo, el disco y los arcos de lente sí están en todos los niveles.
- **El agujero negro vive en una columna a la derecha del CTA** y el texto pasa a alinearse a la izquierda en escritorio (antes, centrado). Con el texto centrado el disco quedaba detrás del titular y no cumplía AA.
- **Extensiones al motor de las Fases 2–4** (no se reabrieron): `PostPass` en `SceneManager`, `stars` en `QualityParams`, `layoutState.cta`, ancla `cta` y `travel` en la coreografía.
- Se movió `mulberry32` a `src/scene/random.ts` para no copiarlo por tercera vez.

**Handoff a la Fase 6**
- Le toca: la fase de pulido (jerarquía y espaciado, microinteracciones, tilt de proyectos, anclas con `lenis.scrollTo`, estado activo del nav, menú móvil accesible, teclado y reduced motion en todo).
- Quedó listo:
  - **Estados en `<html>`** sin cambios: `.has-webgl`, `.scene-ready` (ahora también desactiva el fondo de `.dark-island`), `.no-webgl`, `data-quality`.
  - **Pie de página sobre el velo:** con `.scene-ready` el footer está sobre el canvas; su texto ya usa los tokens `--dark-*` (AA verificado sobre `--space`).
  - **Respaldo CSS del agujero negro** (`.bh-ph`) por si se quiere retocar o animar sin WebGL.
  - `layoutState.cta`, `finaleProgress(layout, y)` y `scrollState.sections.contacto` para atar microinteracciones del CTA (por ejemplo un contador o un cursor magnético en el botón "Escríbenos") sin medir el DOM en el frame loop.
- Pendientes / riesgos:
  - El agujero negro desaparece de pantalla en móvil al llegar al final. Si se quiere verlo en el reposo, hay que compactar el CTA o el pie en móvil.
  - Los anclajes (`#contacto`, el enlace "Hablemos" del header) hacen `scrollTo` al borde de la isla: con `lenis.scrollTo` el scroll pasará por todo el tramo del cierre. Revisar que no se sienta lento y que `scroll-padding-top` no deje el CTA bajo el degradado.
  - `border-radius` de `.dark-island` y su fondo cambian en `.scene-ready`: cualquier estilo nuevo sobre ese contenedor debe contemplar que es transparente con WebGL.
- Para fases posteriores (anotado, no implementado):
  - **Fase 7:** el render no se pausa cuando no hay nada visible (motivo `offscreen`): entre "Qué hacemos" y el final el canvas sigue dibujando el planeta y el velo oculto. `NightSky` y `BlackHole` ya se ocultan solos (`visible = false`), pero el rAF sigue. Medir el costo del pase de lente (render target MSAA ×4 a pantalla completa) en una GPU integrada y en pantallas 4K (DPR 2). Verificar con un navegador real el comportamiento de `100lvh` en móviles con barra de URL dinámica: el velo usa el alto del canvas.
  - **Fase 7:** valorar `premultipliedAlpha` y el costo del `discard` por píxel del velo (cuadro completo, aunque la mayoría de los frames no entra en pantalla).

---

### Fase 6 — UX/UI, microinteracciones y pulido · Sonnet 5.5
**Estado:** Completada · 2026-10-02

_Alcance:_ jerarquía y espaciado en las 9 secciones; microinteracciones; tilt 3D de tarjetas de proyectos; navegación con anclas, estado activo y menú móvil accesible; accesibilidad por teclado; `prefers-reduced-motion` en todo.

**Resumen de cambios**
- `src/styles/base.css`, `src/styles/sections.css` — presión de botones (`scale(0.97)`), subrayado de nav, pie y correo del CTA con `scaleX`, elevación y borde luminoso de `.glass-card` por opacidad, escala del índice al alcanzar un paso del proceso, y brillo radial de las tarjetas de proyectos. Todo dentro de `prefers-reduced-motion: no-preference`, con las duraciones ya definidas en tokens.
- `src/ui/microinteractions.ts` — **nuevo**. Contadores de `12+` y `6` una sola vez al entrar (GSAP + ScrollTrigger). Con puntero fino: el botón del hero se desplaza hacia el cursor dentro de un radio corto (el `span.magnetic` separa ese desplazamiento de la presión del botón) y las `.project-card` se inclinan como máximo 6°.
- `src/ui/nav.ts` — **nuevo**. Anclas con `lenis.scrollTo` (duración acotada a 1.25 s; sin Lenis, scroll nativo). `aria-current` en el enlace de la sección que cruza el centro del viewport, en el header y en el pie. Menú bajo 60 rem: botón con `aria-expanded`, panel, cierre con Escape, con el enlace y al pasar a escritorio, foco atrapado y devuelto al botón. Mientras está abierto, `lenis.stop()`.
- `src/main.ts`, `index.html` — arranque de nav y microinteracciones; botón de menú; `data-count` en las dos métricas; envoltura magnética del botón principal.
- Espaciado móvil del cierre: menos hueco en el CTA y en el pie, y el escenario del agujero negro un poco más bajo, para que al llegar al final se vea la mitad inferior del disco bajo el header. El `padding-top` del CTA no se tocó: el primer texto sigue bajo el velo.

**Verificación**
- `npm run build` sin errores (incluye `tsc`). Peso gzip: **JS inicial 53.88 KB** (antes 52.45; nav y microinteracciones), CSS 6.06 KB, chunk `scene` **146.12 KB** (sin cambio). Sigue bajo el tope de 150 KB.
- Escritorio, con reduced motion desactivado por emulación (el sistema de pruebas lo tiene activo): el ancla `#proyectos` deja la sección a 84 px, que es el `scroll-padding-top`. `aria-current` en header y pie. El magnético desplaza el botón (8.4 px / 3.4 px en la prueba). La tarjeta de proyecto inclina y sube 4 px. Los contadores pasan de `0` a `12+` y `6`. El índice del proceso alcanzado escala a 1.06. A 1000 px el nav queda entre el logo y «Hablemos», con 121 px de aire a cada lado.
- Móvil emulado (~360×780): botones del hero a 320×48 px, apilados, el último termina hacia y=741. Menú abre, enfoca el primer enlace y no mueve el scroll; Escape lo cierra y devuelve el foco al botón. `#blog` queda a 72 px (el padding móvil). Sin scroll horizontal en el contenido. Al final del scroll se ven unos 100 px del agujero negro por debajo del header; el texto del CTA sigue sobre fondo oscuro.
- Reduced motion (carga con el ajuste del sistema): sin Lenis, contadores en su valor final, sin tilt ni magnético.
- **No verificado:** un móvil real, el recorrido completo con un lector de pantalla y Lighthouse.

**Desviaciones del plan**
- **No hay mockup** contra el que corregir un look genérico. La pasada de jerarquía se limitó al cierre móvil (el agujero negro se salía del reposo) y a centrar el nav de escritorio, que el `margin-left: auto` del grupo de acciones había pegado al logo.
- **`24/7` no cuenta.** Solo se animan `12+` y `6`.
- **El panel del menú es opaco** (`--bg`). Con el fondo translúcido el texto de la página se leía detrás de los enlaces.
- **En el reposo móvil el agujero negro no cabe entero.** Compactar padding no alcanza sin recortar el pie. Queda visible la mitad inferior, bajo el header. El `padding-top` del CTA se conservó para no meter el texto en el degradado.
- **Lenis ya resta `scroll-padding-top`.** Un offset manual lo duplicaba y dejaba el ancla 84 px más abajo.

**Handoff a la Fase 7**
- Le toca: la auditoría de rendimiento del Prompt 7 (Lighthouse móvil, perfil del render, calidad adaptativa con CPU 4×, carga diferida, reduced motion y fallback).
- Quedó listo:
  - JS inicial **53.88 KB gzip**, escena **146.12 KB gzip**. El HTML de producción no precarga el chunk de la escena.
  - Estados en `<html>` sin cambios: `.has-webgl`, `.scene-ready`, `.no-webgl`, `data-quality`, y ahora `.nav-open` mientras el menú móvil está abierto.
  - Anclas, menú, contadores, tilt y magnético. Con reduced motion no hay Lenis ni esas animaciones.
- Pendientes / riesgos (siguen siendo de rendimiento, no de esta fase):
  - El render no se pausa con el motivo `offscreen` cuando no hay planeta ni agujero negro en pantalla.
  - Costo del pase de lente (render target MSAA ×4) en GPU integrada y en 4K, y de `backdrop-filter` en header, tarjetas y franjas de vidrio con el canvas detrás. En calidad baja las franjas ya quitan el blur.
  - LCP con el hero a opacidad 0.01. El respaldo CSS a los 3 s sigue ahí.
  - `100lvh` y la barra de URL del móvil: el velo usa el alto del canvas.
  - El sondeo de WebGL en `main.ts` crea y libera un contexto extra.
  - Valorar `premultipliedAlpha` y el `discard` del velo a pantalla completa.

---

### Fase 7 — Auditoría de rendimiento · GPT 5.6
**Estado:** Pendiente

_Alcance:_ Lighthouse móvil (Performance, LCP, CLS, TBT); perfilado del render; verificar calidad adaptativa con CPU 4x más lenta; carga diferida, peso de texturas y bundle; reduced-motion y fallback sin WebGL; informe antes/después con números.
