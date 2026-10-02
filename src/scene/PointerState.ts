/**
 * Contrato: posición normalizada del puntero (-1..1, y hacia arriba), escrita por un listener
 * pasivo y leída por la escena. Solo se activa en dispositivos con hover y puntero fino;
 * en táctil `enabled` es false y x/y quedan en 0.
 */
export interface PointerData {
  x: number;
  y: number;
  enabled: boolean;
}

export const pointerState: PointerData = { x: 0, y: 0, enabled: false };

export function trackPointer(): () => void {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};

  pointerState.enabled = true;
  const onMove = (e: PointerEvent): void => {
    pointerState.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerState.y = 1 - (e.clientY / window.innerHeight) * 2;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onMove);
    pointerState.enabled = false;
    pointerState.x = 0;
    pointerState.y = 0;
  };
}
