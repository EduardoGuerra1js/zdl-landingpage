import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Respuestas al usuario: cursor magnético en el botón principal del hero, inclinación de las
 * tarjetas de proyectos y contadores que corren una sola vez. Nada de esto corre con
 * `prefers-reduced-motion` (los números se quedan en su valor final). El tilt y el magnético
 * además exigen puntero fino.
 */

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export function initMicrointeractions(reducedMotion: boolean): void {
  if (reducedMotion) return;
  gsap.registerPlugin(ScrollTrigger);
  initCounters();
  if (!matchMedia(FINE_POINTER).matches) return;
  initMagnetic();
  initTilt();
}

function initCounters(): void {
  for (const node of document.querySelectorAll<HTMLElement>("[data-count]")) {
    const target = Number(node.dataset.count);
    if (!Number.isFinite(target)) continue;
    const suffix = node.dataset.suffix ?? "";
    const proxy = { n: 0 };
    node.textContent = `0${suffix}`;
    ScrollTrigger.create({
      trigger: node,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(proxy, {
          n: target,
          duration: 0.9,
          ease: "power2.out",
          onUpdate: () => {
            node.textContent = `${Math.round(proxy.n)}${suffix}`;
          },
        });
      },
    });
  }
}

function initMagnetic(): void {
  const button = document.querySelector<HTMLElement>("[data-magnetic]");
  const host = button?.closest<HTMLElement>(".magnetic");
  if (!button || !host) return;
  const xTo = gsap.quickTo(host, "x", { duration: 0.22, ease: "power3.out" });
  const yTo = gsap.quickTo(host, "y", { duration: 0.22, ease: "power3.out" });
  const reach = 72;

  document.documentElement.addEventListener("pointerleave", () => {
    xTo(0);
    yTo(0);
  });

  window.addEventListener(
    "pointermove",
    (event) => {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const limit = reach + Math.hypot(rect.width, rect.height) / 2;
      if (Math.hypot(dx, dy) > limit) {
        xTo(0);
        yTo(0);
        return;
      }
      xTo(dx * 0.28);
      yTo(dy * 0.28);
    },
    { passive: true },
  );
}

function initTilt(): void {
  for (const card of document.querySelectorAll<HTMLElement>(".project-card")) {
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.22, ease: "power2.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.22, ease: "power2.out" });
    const lift = gsap.quickTo(card, "y", { duration: 0.22, ease: "power2.out" });

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      ry((px - 0.5) * 12);
      rx((0.5 - py) * 12);
      lift(-4);
    });

    card.addEventListener("pointerleave", () => {
      rx(0);
      ry(0);
      lift(0);
    });
  }
}
