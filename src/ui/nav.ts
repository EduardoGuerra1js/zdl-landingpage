import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import { SECTION_IDS, type SectionId } from "../scene/ScrollState";

/**
 * Navegación: anclas con Lenis, enlace activo según la sección que cruza el centro
 * y menú móvil con foco atrapado. Con reduced motion no hay Lenis: el scroll es nativo
 * y `scroll-padding-top` hace el mismo offset.
 */

const DESKTOP = "(min-width: 60rem)";
const FOCUSABLE = "a[href], button:not([disabled])";

let header: HTMLElement | null = null;
let toggle: HTMLButtonElement | null = null;
let lenisRef: Lenis | null = null;

export function initNav(lenis: Lenis | null): void {
  lenisRef = lenis;
  initAnchors(lenis);
  initActiveSection();
  initMenu();
}

function focusTarget(target: HTMLElement): void {
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

function isMenuOpen(): boolean {
  return header?.classList.contains("is-menu-open") ?? false;
}

function closeMenu(returnFocus: boolean): void {
  if (!header || !toggle || !isMenuOpen()) return;
  header.classList.remove("is-menu-open");
  document.documentElement.classList.remove("nav-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir menú");
  lenisRef?.start();
  if (returnFocus) toggle.focus();
}

function openMenu(): void {
  if (!header || !toggle) return;
  header.classList.add("is-menu-open");
  document.documentElement.classList.add("nav-open");
  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-label", "Cerrar menú");
  lenisRef?.stop();
  header.querySelector<HTMLElement>(".site-nav a")?.focus({ preventScroll: true });
}

function initAnchors(lenis: Lenis | null): void {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest("a[href^='#']");
    if (!(link instanceof HTMLAnchorElement)) return;
    const id = link.getAttribute("href")?.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    closeMenu(false);
    const hash = `#${id}`;
    if (location.hash !== hash) history.pushState(null, "", hash);
    if (!lenis) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
      focusTarget(target);
      return;
    }
    // Lenis ya descuenta `scroll-padding-top`. Un offset extra bajaría el ancla dos veces.
    const distance = Math.abs(target.getBoundingClientRect().top);
    lenis.scrollTo(target, {
      duration: Math.min(1.25, Math.max(0.45, distance / 2200)),
      easing: (t: number) => 1 - (1 - t) ** 3,
      onComplete: () => focusTarget(target),
    });
  });
}

function initActiveSection(): void {
  gsap.registerPlugin(ScrollTrigger);
  const links = [...document.querySelectorAll<HTMLAnchorElement>(".site-nav a, .site-footer__nav a")];
  const open = new Set<SectionId>();

  const apply = (): void => {
    let current: SectionId | null = null;
    for (const id of SECTION_IDS) {
      if (open.has(id)) current = id;
    }
    const href = current ? `#${current}` : "";
    for (const link of links) {
      if (href !== "" && link.getAttribute("href") === href) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };

  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    ScrollTrigger.create({
      trigger: el,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) open.add(id);
        else open.delete(id);
        apply();
      },
    });
  }

  const center = window.innerHeight / 2;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= center && rect.bottom > center) open.add(id);
  }
  apply();
}

function trapItems(): HTMLElement[] {
  if (!header) return [];
  return [...header.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
}

function initMenu(): void {
  header = document.querySelector(".site-header");
  toggle = header?.querySelector<HTMLButtonElement>(".nav-toggle") ?? null;
  if (!header || !toggle) return;
  const bar = header;

  toggle.addEventListener("click", () => {
    if (isMenuOpen()) closeMenu(false);
    else openMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (!isMenuOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key !== "Tab") return;
    const items = trapItems();
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    const outside = !(active instanceof Node) || !bar.contains(active);
    if (event.shiftKey && (active === first || outside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || outside)) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isMenuOpen()) return;
    if (event.target instanceof Node && bar.contains(event.target)) return;
    closeMenu(false);
  });

  matchMedia(DESKTOP).addEventListener("change", (event) => {
    if (event.matches) closeMenu(false);
  });
}
