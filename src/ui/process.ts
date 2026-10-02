import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Órbita de "Proceso": una curva SVG que pasa por los cuatro índices de paso, se dibuja con el
 * scroll (scrub lineal) y lleva un satélite. Al pasar por un índice, su paso gana `.is-reached`.
 * - La curva se arma en cada `refreshInit` con los centros medidos de los índices, así la
 *   sincronía con los pasos es exacta en cualquier layout (horizontal ≥ 64 rem, vertical debajo).
 * - El rango de scroll va del primer al último índice, a la altura de una "línea de lectura".
 * - Con reduced motion la órbita queda completa y todos los pasos marcados.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
/** Curvatura de cada tramo, en px: hacia arriba en horizontal, hacia la izquierda en vertical. */
const BULGE_ROW = 26;
const BULGE_COLUMN = 10;

export function initProcessOrbit(reducedMotion: boolean): void {
  const track = document.querySelector<HTMLElement>(".process__track");
  const svg = track?.querySelector<SVGSVGElement>(".process__orbit");
  const path = svg?.querySelector<SVGPathElement>(".process__orbit-track");
  const trail = svg?.querySelector<SVGPathElement>(".process__orbit-trail");
  const satellite = svg?.querySelector<SVGGElement>(".process__satellite");
  if (!track || !svg || !path || !trail || !satellite) return;

  const steps = Array.from(track.querySelectorAll<HTMLElement>(".process-step"));
  const indices = steps.map((step) => step.querySelector<HTMLElement>(".process-step__index"));
  const stops = new Float32Array(steps.length);
  const probe = document.createElementNS(SVG_NS, "path");
  let total = 0;
  let firstY = 0;
  let lastY = 0;
  let row = false;
  let reached = -1;

  const build = (): void => {
    const box = track.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    const points = indices.map((el) => {
      const r = el?.getBoundingClientRect();
      return r ? { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 } : { x: 0, y: 0 };
    });
    const first = points[0];
    const last = points[points.length - 1];
    if (!first || !last) return;
    row = Math.abs(last.y - first.y) < 4;
    firstY = first.y;
    lastY = last.y;

    let d = `M${first.x} ${first.y}`;
    stops[0] = 0;
    svg.appendChild(probe);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if (!a || !b) continue;
      const cx = row ? (a.x + b.x) / 2 : a.x - BULGE_COLUMN;
      const cy = row ? a.y - BULGE_ROW : (a.y + b.y) / 2;
      d += ` Q${cx} ${cy} ${b.x} ${b.y}`;
      probe.setAttribute("d", d);
      stops[i] = probe.getTotalLength();
    }
    probe.remove();

    path.setAttribute("d", d);
    trail.setAttribute("d", d);
    total = stops[points.length - 1] ?? 0;
    trail.style.strokeDasharray = `${total}`;
  };

  const apply = (progress: number): void => {
    const length = progress * total;
    trail.style.strokeDashoffset = `${total - length}`;
    const point = path.getPointAtLength(length);
    satellite.setAttribute("transform", `translate(${point.x} ${point.y})`);

    let count = 0;
    if (progress > 0) for (let i = 0; i < stops.length; i++) if (length >= (stops[i] ?? 0) - 0.5) count = i + 1;
    if (count === reached) return;
    reached = count;
    steps.forEach((step, i) => step.classList.toggle("is-reached", i < count));
  };

  ScrollTrigger.addEventListener("refreshInit", build);
  build();

  if (reducedMotion) {
    apply(1);
    ScrollTrigger.addEventListener("refresh", () => apply(1));
    return;
  }

  ScrollTrigger.create({
    trigger: track,
    // Horizontal: se dibuja mientras la fila sube del 75 % al 35 % de la pantalla.
    // Vertical: el satélite acompaña la línea del 65 %, del primer índice al último.
    start: () => `top+=${firstY} ${row ? 75 : 65}%`,
    end: () => (row ? `top+=${firstY} 35%` : `top+=${lastY} 65%`),
    onUpdate: (self) => apply(self.progress),
    onRefresh: (self) => apply(self.progress),
  });
}
