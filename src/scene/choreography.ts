import type { Rect } from "./LayoutState";
import type { FrameContext } from "./SceneManager";
import { finaleSpan, finaleStart } from "./finale";
import { SECTION_IDS, type SectionId } from "./ScrollState";

/**
 * Coreografía del planeta: TABLA DE POSES por sección, interpolada en línea recta con el scroll.
 * - Cada fila es un fotograma clave en el scroll donde `target` tiene progreso `t` (misma
 *   semántica que `scrollState.sections`: 0 entra por abajo, 0.5 centrado, 1 sale por arriba).
 * - `anchor` decide dónde va el planeta en ese fotograma:
 *   `hero` / `about` → pegado al marcador del hero o al panel de "Sobre" (`x`, `y` = 0, `r` es
 *   multiplicador del radio que cabe en el ancla); `view` → posición fija en pantalla
 *   (`x`, `y` en fracciones del semiancho/semialto, `r` en radios del hero).
 * - Dos fotogramas seguidos con el mismo ancla de página hacen que el planeta viaje pegado a ella.
 * - Si el ancla cambia y un extremo tiene `r: 0`, el planeta crece o se encoge en el sitio del
 *   otro extremo (así cambia de ancla sin cruzar el texto).
 * - Los fotogramas se recalculan solo cuando cambian el layout o el viewport; `update` no asigna.
 * - Con reduced motion no hay interpolación: se usa la fila `rest` de la sección activa.
 */

type Anchor = "hero" | "about" | "cta" | "view";

export interface PoseSpec {
  anchor: Anchor;
  x: number;
  y: number;
  r: number;
  /** Inclinación del eje (`spin.rotation.z`, rad). */
  axis: number;
  /** Inclinación extra de los anillos hacia el canto (rad) y giro en el plano de pantalla. */
  ringTilt: number;
  ringRoll: number;
  /** Giro extra del cuerpo (rad) sobre el giro por tiempo. */
  turn: number;
  shadow: number;
  dust: number;
  /** 0 sobre papel claro, 1 dentro del panel oscuro (enciende el holograma, apaga el reflejo). */
  panel: number;
}

interface KeySpec {
  /** `finale`: el tramo del cierre (ver `finale.ts`); su `t` es la fracción de ese tramo. */
  target: SectionId | "about" | "finale";
  /** Progreso del objetivo; `start` es scroll 0. */
  t: number | "start";
  pose: PoseSpec;
  rest?: boolean;
  /** `false`: la pose del ancla se toma en ese scroll y luego queda fija en pantalla. */
  follow?: false;
  /** Cambia de ancla viajando (sin la regla de radio cero): la caída hacia el agujero negro. */
  travel?: true;
}

const base = { axis: 0.32, ringTilt: 0, ringRoll: 0, turn: 0, shadow: 1, dust: 1, panel: 0 };

/**
 * Escritorio ancho (≥ 1152 px: tarjetas de "Qué hacemos" en 4 columnas). Aquí cada sección deja
 * libre el margen superior derecho, junto a su encabezado.
 */
const WIDE: KeySpec[] = [
  { target: "inicio", t: "start", rest: true, follow: false, pose: { ...base, anchor: "hero", x: 0, y: 0, r: 1 } },
  {
    target: "que-hacemos", t: 0.5, rest: true,
    pose: { anchor: "view", x: 0.55, y: 0.3, r: 0.55, axis: 0.45, ringTilt: 0.25, ringRoll: 0, turn: 0.8, shadow: 0.6, dust: 0.6, panel: 0 },
  },
  {
    target: "about", t: 0.4, rest: true,
    pose: { anchor: "about", x: 0, y: 0, r: 1, axis: 0.2, ringTilt: -0.1, ringRoll: 0, turn: 1.6, shadow: 0, dust: 0.7, panel: 1 },
  },
  {
    target: "about", t: 0.62,
    pose: { anchor: "about", x: 0, y: 0, r: 1, axis: 0.2, ringTilt: -0.1, ringRoll: 0, turn: 1.9, shadow: 0, dust: 0.7, panel: 1 },
  },
  {
    target: "proceso", t: 0.5, rest: true,
    pose: { anchor: "view", x: 0.62, y: 0.42, r: 0.4, axis: 0.5, ringTilt: 0.35, ringRoll: -0.1, turn: 2.4, shadow: 0.5, dust: 0.5, panel: 0 },
  },
  {
    target: "proyectos", t: 0.5, rest: true,
    pose: { anchor: "view", x: 0.6, y: 0.45, r: 0.45, axis: 0.25, ringTilt: 0.05, ringRoll: 0.08, turn: 3, shadow: 0.5, dust: 0.5, panel: 0 },
  },
  {
    target: "areas", t: 0.5, rest: true,
    pose: { anchor: "view", x: 0.62, y: 0.68, r: 0.32, axis: 0.4, ringTilt: 0.3, ringRoll: 0, turn: 3.4, shadow: 0.4, dust: 0.4, panel: 0 },
  },
  {
    target: "blog", t: 0.5, rest: true,
    pose: { anchor: "view", x: 0.6, y: 0.42, r: 0.45, axis: 0.35, ringTilt: 0.15, ringRoll: 0, turn: 3.8, shadow: 0.5, dust: 0.5, panel: 0 },
  },
  // Cierre: el planeta sigue en su margen y cae al agujero negro del CTA, encogiéndose hasta 0
  // mientras acelera su giro. En reposo (reduced motion) ya no está.
  {
    target: "finale", t: 0,
    pose: { anchor: "view", x: 0.6, y: 0.42, r: 0.45, axis: 0.35, ringTilt: 0.15, ringRoll: 0, turn: 3.9, shadow: 0.5, dust: 0.5, panel: 0 },
  },
  {
    target: "finale", t: 0.5, travel: true,
    pose: { anchor: "cta", x: 0, y: 0, r: 0, axis: 0.9, ringTilt: 0.5, ringRoll: 0.5, turn: 7, shadow: 0, dust: 0, panel: 0 },
  },
  {
    target: "finale", t: 1, rest: true,
    pose: { anchor: "cta", x: 0, y: 0, r: 0, axis: 0.9, ringTilt: 0.5, ringRoll: 0.5, turn: 7, shadow: 0, dust: 0, panel: 0 },
  },
];

/** Fuera de escena: en una columna el texto llega a ambos bordes y no hay margen libre. */
const away = (turn: number): PoseSpec => ({
  anchor: "view", x: 0, y: 0, r: 0, axis: 0.32, ringTilt: 0, ringRoll: 0, turn, shadow: 0, dust: 0, panel: 0,
});

/**
 * Móvil, tablet y escritorio estrecho (< 1152 px): las rejillas de tarjetas ocupan todo el ancho
 * y no queda margen. El planeta solo vive en el hero y en el panel de "Sobre": se encoge pegado
 * al hero, crece dentro del panel y se encoge al salir de él.
 */
const NARROW: KeySpec[] = [
  { target: "inicio", t: "start", rest: true, pose: { ...base, anchor: "hero", x: 0, y: 0, r: 1 } },
  { target: "inicio", t: 0.7, pose: { ...base, anchor: "hero", x: 0, y: 0, r: 0 } },
  { target: "que-hacemos", t: 0.5, rest: true, pose: away(0.8) },
  { target: "about", t: 0.12, pose: { ...away(1.2), anchor: "about" } },
  {
    target: "about", t: 0.35, rest: true,
    pose: { anchor: "about", x: 0, y: 0, r: 1, axis: 0.2, ringTilt: -0.1, ringRoll: 0, turn: 1.6, shadow: 0, dust: 0.7, panel: 1 },
  },
  {
    target: "about", t: 0.65,
    pose: { anchor: "about", x: 0, y: 0, r: 1, axis: 0.2, ringTilt: -0.1, ringRoll: 0, turn: 1.9, shadow: 0, dust: 0.7, panel: 1 },
  },
  {
    target: "about", t: 0.88,
    pose: { anchor: "about", x: 0, y: 0, r: 0, axis: 0.2, ringTilt: -0.1, ringRoll: 0, turn: 2, shadow: 0, dust: 0.7, panel: 1 },
  },
  { target: "proceso", t: 0.5, rest: true, pose: away(2.4) },
  { target: "proyectos", t: 0.5, rest: true, pose: away(3) },
  { target: "areas", t: 0.5, rest: true, pose: away(3.4) },
  { target: "blog", t: 0.5, rest: true, pose: away(3.8) },
  { target: "finale", t: 0.5, rest: true, pose: away(4) },
];

/** Coincide con el `72rem` de `.cards-grid--4` en `sections.css`. */
const WIDE_MIN_PX = 1152;
/** Cabe el sistema completo (luna en 1.82 radios) en el lado menor del panel. */
const ABOUT_FIT = 3.9;
/** Radio del cuerpo respecto al lado del marcador del hero (`.planet-ph__body` usa `inset: 20%`). */
const HERO_FIT = 0.3;

/** Pose resuelta en unidades de mundo (plano z = 0). */
export interface Pose {
  x: number;
  y: number;
  r: number;
  axis: number;
  ringTilt: number;
  ringRoll: number;
  turn: number;
  shadow: number;
  dust: number;
  panel: number;
}

const FIELDS = 10;
const VIEW = 0;
const HERO = 1;
const ABOUT = 2;
const CTA = 3;
const MAX_KEYS = Math.max(WIDE.length, NARROW.length);

export class Choreography {
  readonly pose: Pose = { x: 0, y: 0, r: 0, axis: 0, ringTilt: 0, ringRoll: 0, turn: 0, shadow: 0, dust: 0, panel: 0 };
  /** `false` si el layout aún no está medido. */
  ready = false;

  private readonly keyScroll = new Float32Array(MAX_KEYS);
  private readonly keyPose = new Float32Array(MAX_KEYS * FIELDS);
  private readonly keyAnchor = new Uint8Array(MAX_KEYS);
  private readonly keyTravel = new Uint8Array(MAX_KEYS);
  private readonly restBySection = new Int8Array(SECTION_IDS.length);
  private keys: KeySpec[] = WIDE;
  private worldPerPx = 0;
  private builtLayout = -1;
  private builtWidth = -1;
  private builtHeight = -1;

  update(ctx: FrameContext): void {
    const { layout } = ctx;
    if (layout.hero.size <= 0 || layout.viewportHeight <= 0 || ctx.viewportHeight <= 0) {
      this.ready = false;
      return;
    }
    if (
      layout.version !== this.builtLayout ||
      ctx.viewportWidth !== this.builtWidth ||
      ctx.viewportHeight !== this.builtHeight
    ) {
      this.build(ctx);
    }
    this.ready = true;

    if (ctx.reducedMotion) {
      const key = this.keys[this.restBySection[ctx.scroll.active] ?? 0];
      if (key) this.resolve(key.pose, ctx.scroll.y, ctx, this.pose);
      return;
    }
    this.sample(ctx.scroll.y);
  }

  private build(ctx: FrameContext): void {
    this.builtLayout = ctx.layout.version;
    this.builtWidth = ctx.viewportWidth;
    this.builtHeight = ctx.viewportHeight;
    this.keys = ctx.viewportWidth >= WIDE_MIN_PX ? WIDE : NARROW;
    this.worldPerPx = (2 * ctx.viewHalfHeight) / ctx.viewportHeight;

    let previous = 0;
    this.keys.forEach((key, i) => {
      const scroll = Math.max(previous, Math.min(this.scrollAt(key, ctx), ctx.layout.scrollMax));
      previous = scroll;
      this.keyScroll[i] = scroll;
      const anchor = key.pose.anchor;
      this.keyAnchor[i] =
        anchor === "view" || key.follow === false ? VIEW : anchor === "hero" ? HERO : anchor === "about" ? ABOUT : CTA;
      this.keyTravel[i] = key.travel ? 1 : 0;
      this.resolve(key.pose, scroll, ctx, this.pose);
      this.write(i);
    });

    SECTION_IDS.forEach((id, s) => {
      let found = 0;
      this.keys.forEach((key, i) => {
        const section = key.target === "about" ? "sobre" : key.target === "finale" ? "contacto" : key.target;
        if (section === id && key.rest) found = i;
      });
      this.restBySection[s] = found;
    });
  }

  private scrollAt(key: KeySpec, ctx: FrameContext): number {
    if (key.t === "start") return 0;
    const vh = ctx.layout.viewportHeight;
    if (key.target === "finale") return finaleStart(ctx.layout) + key.t * finaleSpan(ctx.layout);
    if (key.target === "about") {
      const panel = ctx.layout.about;
      const top = panel.y - panel.height / 2;
      return top - vh + key.t * (panel.height + vh);
    }
    const span = ctx.layout.sections[key.target];
    return span.top - vh + key.t * (span.height + vh);
  }

  /** Convierte una fila de la tabla en una pose de mundo para un scroll dado. */
  private resolve(spec: PoseSpec, scroll: number, ctx: FrameContext, out: Pose): void {
    const worldPerPx = (2 * ctx.viewHalfHeight) / ctx.viewportHeight;
    const heroRadius = ctx.layout.hero.size * HERO_FIT * worldPerPx;

    if (spec.anchor === "view") {
      out.r = spec.r * heroRadius;
      out.x = spec.x * ctx.viewHalfWidth;
      out.y = spec.y * ctx.viewHalfHeight;
    } else {
      const rect: Rect =
        spec.anchor === "hero" ? ctx.layout.hero : spec.anchor === "about" ? ctx.layout.about : ctx.layout.cta;
      const fit = spec.anchor === "about" ? rect.size / ABOUT_FIT : rect.size * HERO_FIT;
      out.r = spec.r * fit * worldPerPx;
      out.x = (rect.x - ctx.viewportWidth / 2) * worldPerPx;
      out.y = (ctx.viewportHeight / 2 - (rect.y - scroll)) * worldPerPx;
    }
    out.axis = spec.axis;
    out.ringTilt = spec.ringTilt;
    out.ringRoll = spec.ringRoll;
    out.turn = spec.turn;
    out.shadow = spec.shadow;
    out.dust = spec.dust;
    out.panel = spec.panel;
  }

  private write(i: number): void {
    const p = this.pose;
    const o = i * FIELDS;
    const k = this.keyPose;
    k[o] = p.x;
    k[o + 1] = p.y;
    k[o + 2] = p.r;
    k[o + 3] = p.axis;
    k[o + 4] = p.ringTilt;
    k[o + 5] = p.ringRoll;
    k[o + 6] = p.turn;
    k[o + 7] = p.shadow;
    k[o + 8] = p.dust;
    k[o + 9] = p.panel;
  }

  private sample(scroll: number): void {
    const count = this.keys.length;
    let a = 0;
    while (a < count - 1 && scroll >= (this.keyScroll[a + 1] ?? 0)) a++;
    const b = Math.min(a + 1, count - 1);
    const start = this.keyScroll[a] ?? 0;
    const span = (this.keyScroll[b] ?? 0) - start;
    const t = b === a || span <= 0 ? 0 : Math.min(1, Math.max(0, (scroll - start) / span));

    const k = this.keyPose;
    const oa = a * FIELDS;
    const ob = b * FIELDS;
    // Los extremos pegados a la página suben con el scroll; los de pantalla se quedan quietos.
    const ay = (k[oa + 1] ?? 0) + this.follow(a, scroll);
    const by = (k[ob + 1] ?? 0) + this.follow(b, scroll);
    const ax = k[oa] ?? 0;
    const bx = k[ob] ?? 0;
    const ra = k[oa + 2] ?? 0;
    const rb = k[ob + 2] ?? 0;
    const p = this.pose;
    // Entre anclas distintas, si un extremo tiene radio 0 el planeta crece o se encoge en el sitio
    // del otro: así no cruza el texto para cambiar de ancla.
    const switching = this.keyAnchor[a] !== this.keyAnchor[b] && this.keyTravel[b] === 0;
    if (switching && ra === 0) {
      p.x = bx;
      p.y = by;
    } else if (switching && rb === 0) {
      p.x = ax;
      p.y = ay;
    } else {
      p.x = ax + (bx - ax) * t;
      p.y = ay + (by - ay) * t;
    }
    p.r = this.mix(oa, ob, 2, t);
    p.axis = this.mix(oa, ob, 3, t);
    p.ringTilt = this.mix(oa, ob, 4, t);
    p.ringRoll = this.mix(oa, ob, 5, t);
    p.turn = this.mix(oa, ob, 6, t);
    p.shadow = this.mix(oa, ob, 7, t);
    p.dust = this.mix(oa, ob, 8, t);
    p.panel = this.mix(oa, ob, 9, t);
  }

  private follow(i: number, scroll: number): number {
    if (this.keyAnchor[i] === VIEW) return 0;
    return (scroll - (this.keyScroll[i] ?? 0)) * this.worldPerPx;
  }

  private mix(oa: number, ob: number, field: number, t: number): number {
    const from = this.keyPose[oa + field] ?? 0;
    return from + ((this.keyPose[ob + field] ?? 0) - from) * t;
  }
}
