import { TestCube } from "./objects/TestCube";
import { pointerState, trackPointer } from "./PointerState";
import { SceneManager } from "./SceneManager";
import { scrollState } from "./ScrollState";

/**
 * Entrada del chunk diferido (incluye Three.js). `main.ts` lo carga con `import()` tras el
 * primer pintado. Crea el canvas, monta la escena y arranca el bucle. Lanza si WebGL falla.
 */
export interface StartSceneOptions {
  reducedMotion: boolean;
  onContextLost: () => void;
}

export function startScene(options: StartSceneOptions): SceneManager {
  const canvas = document.createElement("canvas");
  canvas.className = "scene-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  try {
    const manager = new SceneManager(canvas, {
      scroll: scrollState,
      pointer: pointerState,
      reducedMotion: options.reducedMotion,
      onContextLost: options.onContextLost,
    });
    if (!options.reducedMotion) trackPointer();
    manager.add(new TestCube());
    manager.start();
    return manager;
  } catch (error) {
    canvas.remove();
    throw error;
  }
}
