import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections.css";
import { gsap } from "gsap";
import { initMicrointeractions } from "./ui/microinteractions";
import { initNav } from "./ui/nav";
import { initProcessOrbit } from "./ui/process";
import { initReveals } from "./ui/reveals";
import { initScroll } from "./ui/scroll";

/**
 * Arranque: el texto pinta sin JS de 3D. El scroll (Lenis + ScrollTrigger) se cablea de inmediato;
 * el chunk de Three.js se pide en paralelo (no espera a `load`) y el canvas entra con fade.
 * El marcador CSS del hero queda invisible con JS hasta `.has-webgl` o `.no-webgl`.
 * Estados en <html>: `.has-webgl` (canvas activo), `.scene-ready` (terminó el fundido: la escena
 * ya dibuja lo que sustituye al CSS, como el fondo del panel de "Sobre") o `.no-webgl`, y
 * `data-quality="high|medium|low"` con el nivel vigente (útil para recortar CSS caro en "low").
 */

const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sceneModule = import("./scene");

const lenis = initScroll(reducedMotion);
initProcessOrbit(reducedMotion);
initReveals(reducedMotion);
initNav(lenis);
initMicrointeractions(reducedMotion);
void bootScene();

async function bootScene(): Promise<void> {
  try {
    const { startScene } = await sceneModule;
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

function reveal(canvas: HTMLCanvasElement): void {
  const duration = reducedMotion ? 0 : 0.8;
  root.classList.add("has-webgl");
  gsap.to(canvas, {
    autoAlpha: 1,
    duration,
    ease: "power1.out",
    onComplete: () => root.classList.add("scene-ready"),
  });
}

function useFallback(): void {
  root.classList.remove("has-webgl", "scene-ready");
  root.classList.add("no-webgl");
  gsap.set(".planet-ph", { clearProps: "opacity,visibility" });
  document.querySelector(".scene-canvas")?.remove();
}
