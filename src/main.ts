import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections.css";
import { gsap } from "gsap";
import { initScroll } from "./ui/scroll";

/**
 * Arranque: el texto pinta sin JS de 3D. El scroll (Lenis + ScrollTrigger) se cablea de inmediato;
 * Three.js llega en un chunk aparte tras `load` y un hueco ocioso, y el canvas entra con fade.
 * Estados en <html>: `.has-webgl` (canvas activo) o `.no-webgl` (fallback estático), y
 * `data-quality="high|medium|low"` con el nivel vigente (útil para recortar CSS caro en "low").
 */

const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

initScroll(reducedMotion);
afterFirstPaint(bootScene);

function afterFirstPaint(callback: () => void): void {
  const schedule = (): void => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(callback, { timeout: 2000 });
    else window.setTimeout(callback, 200);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
}

async function bootScene(): Promise<void> {
  if (!supportsWebGL()) {
    useFallback();
    return;
  }
  try {
    const { startScene } = await import("./scene");
    const manager = startScene({ reducedMotion, onContextLost: useFallback });
    root.dataset.quality = manager.quality.current.level;
    manager.quality.onChange((params) => {
      root.dataset.quality = params.level;
    });
    reveal(manager.canvas);
  } catch (error) {
    console.warn("[scene] WebGL no disponible, se usa el fallback estático.", error);
    useFallback();
  }
}

function supportsWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

function reveal(canvas: HTMLCanvasElement): void {
  const placeholder = document.querySelector(".hero__visual .planet-ph");
  const duration = reducedMotion ? 0 : 0.8;
  root.classList.add("has-webgl");
  const tl = gsap.timeline();
  tl.to(canvas, { autoAlpha: 1, duration, ease: "power1.out" }, 0);
  if (placeholder) tl.to(placeholder, { autoAlpha: 0, duration, ease: "power1.out" }, 0);
}

function useFallback(): void {
  root.classList.remove("has-webgl");
  root.classList.add("no-webgl");
  gsap.set(".planet-ph", { clearProps: "opacity,visibility" });
  document.querySelector(".scene-canvas")?.remove();
}
