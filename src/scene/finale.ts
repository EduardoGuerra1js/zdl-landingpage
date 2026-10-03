import type { LayoutData } from "./LayoutState";

/**
 * Tramo de scroll del cierre (isla oscura): lo comparten la coreografía del planeta (que colapsa),
 * el cielo nocturno y el agujero negro, para que los tres vayan sincronizados.
 * - Empieza cuando el borde superior de la isla cruza `START` (fracción del viewport desde arriba).
 * - Dura hasta el final de la página, recortado a `SPAN` para que el estado final quede en reposo
 *   antes de llegar al tope del scroll.
 * Todo en px de documento y sin asignaciones: se llama en el bucle de render.
 */

const START = 0.72;
const SPAN = 0.85;

/** Scroll (px) en el que arranca el cierre. */
export function finaleStart(layout: Readonly<LayoutData>): number {
  return layout.sections.contacto.top - START * layout.viewportHeight;
}

/** Longitud (px) del tramo, nunca menor que 1. */
export function finaleSpan(layout: Readonly<LayoutData>): number {
  return Math.max(1, (layout.scrollMax - finaleStart(layout)) * SPAN);
}

/** Progreso del cierre, 0 (aún claro) a 1 (agujero negro completo). */
export function finaleProgress(layout: Readonly<LayoutData>, scrollY: number): number {
  const p = (scrollY - finaleStart(layout)) / finaleSpan(layout);
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
