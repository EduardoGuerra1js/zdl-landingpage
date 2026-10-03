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
  const aboutPanel = document.querySelector<HTMLElement>(".about__panel");
  const ctaVisual = document.querySelector<HTMLElement>(".cta__visual");
  const measure = (): void => {
    scrollState.y = window.scrollY;
    if (heroVisual) writeRect(heroVisual, layoutState.hero);
    if (aboutPanel) writeRect(aboutPanel, layoutState.about);
    if (ctaVisual) writeRect(ctaVisual, layoutState.cta);
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const box = el.getBoundingClientRect();
      layoutState.sections[id].top = box.top + window.scrollY;
      layoutState.sections[id].height = box.height;
    }
    layoutState.viewportHeight = window.innerHeight;
    layoutState.scrollMax = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    layoutState.version++;
    scrollState.version++;
  };
  ScrollTrigger.addEventListener("refresh", measure);
  measure();
  refreshOnReflow();

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

/**
 * ScrollTrigger solo vuelve a medir al cargar y al cambiar el tamaño de la ventana. Si el
 * documento cambia de alto o de ancho por otra causa (fuentes que llegan tarde, la barra de
 * scroll que aparece), sus posiciones y `layoutState` quedarían viejos: se refresca, como mucho
 * una vez por frame.
 */
function refreshOnReflow(): void {
  const doc = document.documentElement;
  let height = doc.scrollHeight;
  let width = doc.clientWidth;
  let queued = false;
  const check = (): void => {
    queued = false;
    if (doc.scrollHeight === height && doc.clientWidth === width) return;
    height = doc.scrollHeight;
    width = doc.clientWidth;
    ScrollTrigger.refresh();
  };
  new ResizeObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(check);
  }).observe(document.body);
  void document.fonts.ready.then(() => ScrollTrigger.refresh());
}

function writeRect(el: HTMLElement, out: Rect): void {
  const box = el.getBoundingClientRect();
  out.x = box.left + box.width / 2;
  out.y = box.top + window.scrollY + box.height / 2;
  out.width = box.width;
  out.height = box.height;
  out.size = Math.min(box.width, box.height);
}
