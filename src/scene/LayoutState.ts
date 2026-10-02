import { SECTION_IDS, type SectionId } from "./ScrollState";

/**
 * Contrato: medidas del DOM que la escena necesita para alinearse con el contenido.
 * - ESCRIBE solo `ui/scroll.ts`, en cada `refresh` de ScrollTrigger (carga, resize, fuentes).
 * - Coordenadas en px de documento (no de viewport): la escena resta `scrollState.y`.
 * - La escena solo LEE; nunca mide el DOM en el frame loop.
 * Este módulo no importa Three.js: vive en el bundle inicial.
 */

export interface Rect {
  /** Centro en px de documento. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Lado menor, en px. */
  size: number;
}

export interface Span {
  /** Borde superior en px de documento. */
  top: number;
  height: number;
}

export interface LayoutData {
  /** `.hero__visual .planet-ph`: el cuadrado donde vive el planeta del hero. */
  hero: Rect;
  /** `.about__panel`: el panel oscuro de "Sobre" (su fondo lo dibuja la escena). */
  about: Rect;
  /** Tramo vertical de cada sección con `id`. */
  sections: Record<SectionId, Span>;
  /** `window.innerHeight` (la referencia de ScrollTrigger), en px. */
  viewportHeight: number;
  /** Scroll máximo del documento, en px. */
  scrollMax: number;
  version: number;
}

function createRect(): Rect {
  return { x: 0, y: 0, width: 0, height: 0, size: 0 };
}

function createSpans(): Record<SectionId, Span> {
  const spans = {} as Record<SectionId, Span>;
  for (const id of SECTION_IDS) spans[id] = { top: 0, height: 0 };
  return spans;
}

export const layoutState: LayoutData = {
  hero: createRect(),
  about: createRect(),
  sections: createSpans(),
  viewportHeight: 0,
  scrollMax: 0,
  version: 0,
};
