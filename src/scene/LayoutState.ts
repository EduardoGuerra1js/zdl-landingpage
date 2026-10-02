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
  /** Lado del cuadrado del marcador, en px. */
  size: number;
}

export interface LayoutData {
  /** `.hero__visual .planet-ph`: el cuadrado donde vive el planeta del hero. */
  hero: Rect;
  version: number;
}

export const layoutState: LayoutData = {
  hero: { x: 0, y: 0, size: 0 },
  version: 0,
};
