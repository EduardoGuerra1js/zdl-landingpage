import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "../scene/ScrollState";

/**
 * Revelados: UNA secuencia de entrada en el hero y un revelado mínimo (opacidad + 12 px) por
 * bloque `[data-reveal]`, sin stagger dentro del bloque. También dispara, una sola vez, el
 * escaneo AR de "Sobre" (`scrollState.scan`), que la escena lee.
 * El estado inicial del hero lo pone el CSS con `.js` (script en línea del <head>) para que no
 * parpadee; con reduced motion no se oculta nada y todo queda en su estado final.
 */

const SHIFT = 12;
const SCAN_DURATION = 2.4;

export function initReveals(reducedMotion: boolean): void {
  initScan(reducedMotion);
  if (reducedMotion) return;
  playHero();
  initBlocks();
}

function playHero(): void {
  const items = gsap.utils.toArray<HTMLElement>("[data-hero-reveal]");
  if (items.length === 0) return;
  const tl = gsap.timeline({ defaults: { duration: 0.7, ease: "power2.out" } });
  items.forEach((item, i) => {
    // Desde 0.01 y no 0: Chrome no cuenta como LCP un elemento con opacidad 0 hasta que aparece.
    tl.fromTo(item, { opacity: 0.01, y: SHIFT }, { opacity: 1, y: 0 }, i * 0.09);
  });
}

function initBlocks(): void {
  const fold = window.innerHeight * 0.9;
  for (const block of gsap.utils.toArray<HTMLElement>("[data-reveal]")) {
    // Lo que ya está en pantalla al cargar no se oculta: evitaría un parpadeo.
    if (block.getBoundingClientRect().top < fold) continue;
    gsap.set(block, { opacity: 0, y: SHIFT });
    ScrollTrigger.create({
      trigger: block,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(block, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", clearProps: "opacity,transform" });
      },
    });
  }
}

function initScan(reducedMotion: boolean): void {
  const panel = document.querySelector(".about__panel");
  if (!panel) return;
  if (reducedMotion) {
    scrollState.scan = 1;
    scrollState.version++;
    return;
  }
  ScrollTrigger.create({
    trigger: panel,
    start: "center 62%",
    once: true,
    onEnter: () => {
      gsap.to(scrollState, {
        scan: 1,
        duration: SCAN_DURATION,
        ease: "sine.inOut",
        onUpdate: () => {
          scrollState.version++;
        },
      });
    },
  });
}
