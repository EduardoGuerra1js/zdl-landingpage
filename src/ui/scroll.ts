import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { layoutState, type Rect } from "../scene/LayoutState";
import { SECTION_IDS, scrollState } from "../scene/ScrollState";

/**
 * Contrato: único escritor de `scrollState` y `layoutState`.
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
      scrollState.y = instance.scroll;
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
      scrollState.y = self.scroll();
      scrollState.version++;
    },
  });

  const heroVisual = document.querySelector<HTMLElement>(".hero__visual .planet-ph");
  const measure = (): void => {
    scrollState.y = window.scrollY;
    if (heroVisual) writeRect(heroVisual, layoutState.hero);
    layoutState.version++;
    scrollState.version++;
  };
  ScrollTrigger.addEventListener("refresh", measure);
  measure();

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

function writeRect(el: HTMLElement, out: Rect): void {
  const box = el.getBoundingClientRect();
  out.x = box.left + box.width / 2;
  out.y = box.top + window.scrollY + box.height / 2;
  out.size = Math.min(box.width, box.height);
}
