import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { SECTION_IDS, scrollState } from "../scene/ScrollState";

/**
 * Contrato: único escritor de `scrollState`.
 * Lenis suaviza el scroll nativo (no transforma el DOM), así que ScrollTrigger mide posiciones
 * reales. Lenis avanza en el ticker de GSAP: un solo requestAnimationFrame para ambos.
 * Con `reducedMotion` no se crea Lenis y el scroll es nativo.
 */
export function initScroll(reducedMotion: boolean): Lenis | null {
  gsap.registerPlugin(ScrollTrigger);

  let lenis: Lenis | null = null;
  if (!reducedMotion) {
    lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", (instance: Lenis) => {
      scrollState.velocity = instance.velocity;
      ScrollTrigger.update();
    });
    gsap.ticker.add((time) => lenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  ScrollTrigger.create({
    trigger: document.documentElement,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      scrollState.page = self.progress;
      scrollState.version++;
    },
  });

  SECTION_IDS.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        scrollState.sections[id] = self.progress;
        scrollState.version++;
      },
      // onUpdate no dispara si la sección ya está fuera de rango al cargar; esto fija 0 o 1.
      onRefresh: (self) => {
        scrollState.sections[id] = self.progress;
        scrollState.version++;
      },
    });

    ScrollTrigger.create({
      trigger: el,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (!self.isActive) return;
        scrollState.active = index;
        scrollState.version++;
      },
    });
  });

  return lenis;
}
