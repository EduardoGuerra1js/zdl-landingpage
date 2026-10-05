/**
 * Contrato: estado único del scroll, compartido entre la UI y la escena.
 * - ESCRIBEN solo `ui/scroll.ts` (Lenis + GSAP ScrollTrigger) y, para `scan`, `ui/reveals.ts`.
 * - La escena solo LEE; nunca consulta el DOM en el frame loop.
 * - Las escrituras mutan este objeto en sitio (cero asignaciones) e incrementan `version`.
 * Este módulo no importa Three.js: vive en el bundle inicial.
 */

/** IDs de sección en orden de página (coinciden con los `id` de `index.html`). */
export const SECTION_IDS = [
  "inicio",
  "que-hacemos",
  "sobre",
  "proceso",
  "proyectos",
  "servicios",
  "areas",
  "contacto",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface ScrollStateData {
  /** Progreso de toda la página, 0 (arriba) a 1 (abajo). */
  page: number;
  /** Scroll vertical en px (el que pinta el DOM en este frame). */
  y: number;
  /**
   * Progreso por sección, 0..1: 0 cuando el borde superior de la sección entra por abajo
   * del viewport, 1 cuando su borde inferior sale por arriba.
   */
  sections: Record<SectionId, number>;
  /** Índice en `SECTION_IDS` de la sección que cruza el centro del viewport. */
  active: number;
  /** Velocidad de Lenis en px/frame (con signo). 0 sin Lenis (reduced motion). */
  velocity: number;
  /** Escaneo AR de "Sobre", 0..1. Un tween lo lleva a 1 una sola vez; no depende del scroll. */
  scan: number;
  /** Se incrementa con cada escritura; permite render bajo demanda. */
  version: number;
}

function createSections(): Record<SectionId, number> {
  const sections = {} as Record<SectionId, number>;
  for (const id of SECTION_IDS) sections[id] = 0;
  return sections;
}

export const scrollState: ScrollStateData = {
  page: 0,
  y: 0,
  sections: createSections(),
  active: 0,
  velocity: 0,
  scan: 0,
  version: 0,
};
