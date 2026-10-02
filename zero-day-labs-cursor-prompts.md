# Zero Day Labs — Contexto y prompts maestros para Cursor

Cómo usarlo: crea el proyecto vacío, pega la sección 1 como regla permanente (`.cursor/rules/project.mdc`, con `alwaysApply: true`), adjunta los dos mockups y el prototipo de referencia al chat del agente, y ejecuta los prompts de la sección 2 **uno por uno**, revisando el resultado antes de pasar al siguiente. Usa el modo Plan antes del modo Agent en los prompts 3 a 6.

---

## 1. Contexto permanente (regla del proyecto)

### Qué es
Landing page **one page** de **Zero Day Labs**, un estudio independiente de investigación y desarrollo de tecnología. El contenido gira en torno a **realidad aumentada (AR) y 3D**: prototipos, entornos 3D, gemelos digitales, interfaces espaciales y experimentación en el mundo real. Idioma: español. Tono: curioso, claro, ambicioso, sin jerga vacía.

### Referencias visuales
- Mockup principal: versión **morada y clara** (fondo casi blanco, acentos violeta, planeta oscuro con anillos orbitales en el hero, tarjetas de vidrio, bandas oscuras con planetas y montañas, banner final oscuro).
- Mockup secundario: versión blanco y negro (logo Z con anillo orbital, secciones oscuras alternadas). Úsalo solo como inspiración de ritmo y contraste.
- Prototipo funcional de referencia: `zero-day-labs.html` (Three.js + GSAP). Es un punto de partida, no el resultado final: reescríbelo con mejor arquitectura y calidad visual.

### Secciones (en orden)
1. Hero: eyebrow, titular "Diseñamos el futuro desde el laboratorio.", subtítulo, dos botones, planeta 3D.
2. Franja de 4 pilares (investigación aplicada, prototipos funcionales, equipos multidisciplinarios, impacto sostenible).
3. Qué hacemos: 4 tarjetas.
4. Sobre Zero Day Labs: texto, 3 métricas (12+ proyectos, 6 áreas, 24/7), panel oscuro con planeta.
5. Proceso: Explorar, Diseñar, Construir, Lanzar (esta sí es una secuencia real).
6. Proyectos destacados: 3 tarjetas (Interfaces del futuro, Sistemas orbitales, Hábitats modulares).
7. Áreas que exploramos: 8 chips (IA, robótica, hardware embebido, computación espacial, datos, interfaces, energía, biotecnología).
8. Blog: 3 tarjetas.
9. CTA final oscuro con agujero negro + footer.

### Dirección de diseño (modo claro como principal)
- Paleta base: `--bg #F7F6FC`, `--ink #12101F`, `--muted #5D5A73`, `--accent #7C5CFF`, `--accent-soft #EDE9FF`, `--space #07061A` (islas oscuras).
- Modo oscuro opcional vía `prefers-color-scheme`, pero **todo se diseña y se valida primero en claro**.
- Tipografía: una sola familia sans geométrica con buen peso display (por ejemplo Manrope o Sora) y una mono pequeña solo para datos. Escala tipográfica clara, titulares con tracking negativo, líneas de menos de 70 caracteres.
- Estructura visual: tarjetas de vidrio sutil (blur + borde violeta tenue), radios coherentes por jerarquía, mucho aire, contraste AA mínimo.
- Evita: gradientes decorativos genéricos, animaciones de entrada idénticas en cada tarjeta, brillos aditivos sobre fondo claro (se pierden).

### Principio del fondo "WOW" en modo claro
Un solo **canvas WebGL fijo** detrás del contenido. El planeta es un objeto oscuro de aspecto premium sobre papel claro (rim light violeta, atmósfera con fresnel en blending normal, sombras suaves). El agujero negro vive en la **isla oscura final**, donde el blending aditivo sí luce. La transición claro a oscuro es el gran momento de la página.

### Coreografía del scroll (un momento memorable por sección, el resto discreto)
- Hero: planeta grande a la derecha, anillos orbitales dibujados, polvo de partículas muy leve.
- Qué hacemos: el planeta se desplaza y se reduce, con parallax en capas.
- Sobre: capa tipo holograma AR (malla wireframe y línea de escaneo) que recorre el planeta una vez, conectando con el tema de realidad aumentada.
- Proceso: una órbita SVG que se dibuja mientras avanzan los pasos, con un satélite que la recorre.
- Proyectos: inclinación 3D sutil de tarjetas con el puntero (solo dispositivos con hover) y luz que sigue al cursor.
- CTA: el planeta colapsa, el fondo se oscurece, aparecen estrellas y un agujero negro con lente gravitacional.

### Stack
Vite + TypeScript (sin framework de UI para esta landing), Three.js, GSAP + ScrollTrigger, Lenis para scroll suave. Si se prefiere React: React Three Fiber + drei. Shaders propios en GLSL para planeta, atmósfera, disco y lente.

### Reglas de rendimiento (obligatorias, móvil primero)
- Un único renderer y un único canvas; `devicePixelRatio` máximo 2 en escritorio y 1.5 en móvil.
- Calidad adaptativa por niveles (alto/medio/bajo): mide FPS durante los primeros segundos y baja partículas, resolución y efectos si el promedio cae de 50 FPS.
- Animar partículas **en la GPU** (vertex shader con uniforms de tiempo y progreso), sin actualizar buffers desde JavaScript en cada frame.
- Cero asignaciones de memoria dentro del bucle de render; reutiliza vectores y objetos.
- Pausar el render cuando la pestaña está oculta y cuando el elemento que lo necesita no está en pantalla.
- Sin postprocesado pesado en móvil (bloom solo en escritorio y de baja resolución).
- Texturas en WebP/KTX2, tamaño máximo 1024 en móvil. Carga diferida del código 3D después del primer pintado (el texto debe aparecer sin esperar a WebGL).
- `prefers-reduced-motion`: sin movimiento continuo, solo estado estático por sección.
- Fallback sin WebGL: imagen estática del planeta con CSS.
- Metas: Lighthouse móvil 90+, LCP menor a 2.5 s, CLS cercano a 0, bundle JS inicial menor a 150 KB gzip sin contar Three.js diferido.

### Microinteracciones (sutiles, que respondan a acciones del usuario)
Botones con feedback de presión, enlaces con subrayado animado, tarjetas con elevación y borde luminoso al enfocar o pasar el cursor, contadores de métricas que se animan una sola vez al entrar, cursor magnético solo en el botón principal de escritorio. Foco visible siempre. Nada de animaciones de entrada repetidas en cada elemento: una sola secuencia orquestada al cargar el hero y revelados contenidos en el resto.

---

## 2. Prompts maestros (ejecutar en orden)

### Prompt 1 — Base y sistema de diseño
```
Lee la regla del proyecto y los mockups adjuntos. Crea el proyecto con Vite + TypeScript e instala three, gsap y lenis.
Construye solo el HTML/CSS de la página completa (sin 3D todavía) en modo claro, fiel al mockup morado:
- tokens CSS (color, tipografía fluida con clamp, espaciado, radios, sombras) y una escala tipográfica definida;
- las 9 secciones con contenido real en español (usa el copy de la regla; completa lo que falte con textos específicos de AR/3D, nada genérico);
- componentes reutilizables: botón primario/secundario, tarjeta de vidrio, chip, métrica, paso de proceso;
- responsive de 360 px a 1440 px, foco visible, contraste AA, HTML semántico.
Antes de escribir código, entrégame un plan corto: paleta, tipografías elegidas y por qué, y wireframe ASCII de hero y de una sección de tarjetas. Espera mi OK y luego implementa.
```

### Prompt 2 — Motor del fondo 3D y calidad adaptativa
```
Crea src/scene/ con una arquitectura limpia:
- SceneManager: un solo canvas fijo, renderer con alpha, resize con ResizeObserver, bucle de render con pausa por visibilidad de pestaña.
- QualityManager: tres niveles (alto/medio/bajo), detección inicial por dispositivo y reducción dinámica si el FPS promedio baja de 50. Expone parámetros: pixelRatio, cantidad de partículas, bloom on/off, tamaño de texturas.
- ScrollState: objeto único con el progreso por sección (0 a 1) alimentado por GSAP ScrollTrigger y Lenis. La escena solo LEE este estado; nunca consulta el DOM en el bucle.
- Carga diferida: la escena se inicializa tras el primer pintado y hace fade-in del canvas.
- Fallback sin WebGL y soporte de prefers-reduced-motion.
No dibujes aún el planeta: deja un cubo de prueba que reaccione al scroll para validar la arquitectura. Documenta en comentarios breves el contrato de cada módulo.
```

### Prompt 3 — Planeta del hero (el elemento WOW en modo claro)
```
Implementa el planeta del hero con calidad cinematográfica sobre fondo CLARO:
- Esfera con shader propio: textura procedural o WebP 1024 con relieve (normal/bump), iluminación direccional con rim light violeta, tono oscuro tipo roca/obsidiana que contraste con el papel claro.
- Atmósfera con fresnel en blending NORMAL (no aditivo, se perdería sobre claro) y una sombra suave proyectada sobre la página.
- Dos anillos orbitales finos violeta, uno translúcido y otro tipo línea, más una luna que orbita con velocidad lenta.
- Polvo de partículas muy leve alrededor, animado en el vertex shader.
- Parallax sutil con el puntero (máx. 0.4 unidades) y deshabilitado en táctil.
- Posición responsive: a la derecha en escritorio, arriba y reducido en móvil sin tapar el titular.
Proponme primero 2 variantes de estilo (por ejemplo "obsidiana pulida" vs "roca lunar") con una descripción corta y elige una justificando por qué se ve mejor sobre fondo claro. Luego implementa y mide el costo en FPS en nivel medio.
```

### Prompt 4 — Coreografía del scroll
```
Implementa la coreografía de scroll descrita en la regla del proyecto, usando ScrollState:
- El planeta recorre la página (posición, escala, rotación, inclinación de anillos) con scrub suave, sin saltos entre secciones y sin tapar texto: mantenlo en los márgenes y deja que las tarjetas de vidrio lo desenfoquen.
- Sección Sobre: efecto holograma AR (wireframe + línea de escaneo) que recorre el planeta una sola vez al entrar.
- Sección Proceso: órbita SVG que se dibuja con el scroll y un satélite que la recorre, sincronizado con los 4 pasos.
- Revelados: UNA secuencia de entrada orquestada en el hero y revelados mínimos (opacidad + 12 px de desplazamiento) en el resto; nada de stagger en cada tarjeta.
Usa ease lineal para todo lo atado al scroll y easing suave solo para respuestas a acciones del usuario. Entrégame una tabla con el estado (posición, escala, rotación, inclinación) en cada sección para que yo pueda ajustarlo.
```

### Prompt 5 — Agujero negro y transición final
```
Implementa el CTA final:
- Transición de claro a oscuro: el fondo pasa a #07061A de forma gradual mientras el planeta colapsa y aparecen estrellas (Points con tamaño atenuado y parpadeo sutil en el shader).
- Agujero negro: horizonte negro, disco de acreción con rotación diferencial (las partículas internas giran más rápido, calculado en el vertex shader), color caliente a violeta, y halo de lente gravitacional. En escritorio añade distorsión de pantalla (lente) con un pase de postprocesado barato; en móvil usa solo el halo y el disco, sin postprocesado.
- Debe verse espectacular pero costar poco: 9000 partículas en nivel alto, 4000 en medio, 1500 en bajo.
- El texto y el botón del CTA deben mantener contraste AA sobre el fondo oscuro.
Dame una captura o descripción de cómo se ve en el punto medio de la transición, donde el fondo aún está a medias, y corrige cualquier problema de legibilidad.
```

### Prompt 6 — UX/UI, microinteracciones y pulido
```
Haz una pasada de diseño y UX, sin añadir efectos nuevos de fondo:
- Revisa jerarquía tipográfica, espaciados, alineaciones y contraste en las 9 secciones; corrige lo que se vea genérico frente al mockup.
- Microinteracciones: botón con presión, subrayado animado en enlaces, tarjetas con elevación y borde luminoso al enfocar o hover, contadores que se animan una vez, cursor magnético solo en el botón principal de escritorio. Todo con transform/opacity, duración 150 a 300 ms.
- Inclinación 3D sutil de tarjetas de proyectos con el puntero, solo en dispositivos con hover.
- Navegación: anclas con scroll suave, estado activo del enlace según la sección, menú móvil accesible.
- Accesibilidad: navegación por teclado completa, foco visible, aria donde haga falta, prefers-reduced-motion respetado en TODO.
Lista al final lo que cambiaste y por qué, en máximo 10 viñetas.
```

### Prompt 7 — Auditoría de rendimiento
```
Audita y optimiza para móviles de gama media:
1. Ejecuta Lighthouse móvil y reporta Performance, LCP, CLS y TBT.
2. Perfila el render: busca asignaciones en el bucle, draw calls innecesarias y overdraw del canvas.
3. Verifica que la calidad adaptativa baje de nivel correctamente simulando CPU 4x más lenta.
4. Confirma la carga diferida del 3D, el peso de texturas, el tamaño del bundle y que el contenido de texto aparece sin esperar a WebGL.
5. Prueba prefers-reduced-motion y el fallback sin WebGL.
Corrige lo que no cumpla las metas de la regla del proyecto y dame un informe antes/después con números.
```

---

## 3. Consejos para trabajar con el agente
- Adjunta siempre los mockups y una captura de tu navegador en móvil y escritorio al pedir ajustes visuales; los agentes corrigen mucho mejor con una imagen delante.
- Pide cambios de uno en uno (un elemento por prompt) para poder revertir con facilidad; haz commit después de cada prompt.
- Si el agente propone una librería nueva, pídele justificar el peso que agrega al bundle.
- Prueba en un teléfono real, no solo en el modo responsive del navegador: el rendimiento de WebGL cambia mucho.
