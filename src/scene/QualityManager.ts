/**
 * Contrato: decide el nivel de calidad (alto/medio/bajo) y expone sus parámetros.
 * - Nivel inicial por dispositivo: móvil → medio; pocos núcleos/memoria o GPU por software → bajo.
 * - `sample(delta)` se llama una vez por frame renderizado. Si el FPS promedio de una ventana
 *   de 2 s cae de 50, baja un nivel. Nunca sube, para no oscilar.
 * - `onChange` avisa a la escena; cada objeto adapta partículas, resolución y efectos.
 * - `?quality=alto|medio|bajo` en la URL fuerza un nivel fijo (pruebas de la Fase 7).
 */

export type QualityLevel = "low" | "medium" | "high";

export interface QualityParams {
  level: QualityLevel;
  /** Ya limitado por dispositivo: máx. 2 en escritorio, 1.5 en móvil. */
  pixelRatio: number;
  /** Partículas del agujero negro. */
  particles: number;
  /** Polvo alrededor del planeta. */
  dustParticles: number;
  /** Estrellas del cielo nocturno del cierre. */
  stars: number;
  /** Postprocesado (pase de lente del agujero negro): solo escritorio en nivel alto. */
  bloom: boolean;
  /** Lado máximo de textura en px (1024 como tope en móvil). */
  textureSize: number;
}

const LEVELS: readonly QualityLevel[] = ["low", "medium", "high"];

const PRESETS: Record<QualityLevel, Omit<QualityParams, "level" | "pixelRatio" | "bloom"> & { maxDpr: number }> = {
  high: { maxDpr: 2, particles: 9000, dustParticles: 600, stars: 700, textureSize: 2048 },
  medium: { maxDpr: 1.5, particles: 4000, dustParticles: 300, stars: 400, textureSize: 1024 },
  low: { maxDpr: 1, particles: 1500, dustParticles: 120, stars: 200, textureSize: 512 },
};

const URL_LEVELS: Record<string, QualityLevel> = { alto: "high", medio: "medium", bajo: "low" };

const TARGET_FPS = 50;
const WARMUP_S = 1;
const WINDOW_S = 2;
/** Cada frame cuenta como máximo esto: un tirón aislado apenas mueve la media, uno lento constante sí. */
const MAX_FRAME_WEIGHT = 0.1;
/** Huecos mayores (depurador, pestaña recién vuelta) no son rendimiento: reinician la medición. */
const MAX_SAMPLE_DELTA = 1;

type Listener = (params: Readonly<QualityParams>) => void;

export class QualityManager {
  readonly isMobile: boolean;
  private index: number;
  private readonly locked: boolean;
  private readonly params: QualityParams;
  private readonly listeners: Listener[] = [];
  private warmup = WARMUP_S;
  private windowTime = 0;
  private windowFrames = 0;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.isMobile = matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

    const forced = URL_LEVELS[new URLSearchParams(location.search).get("quality") ?? ""];
    this.locked = forced !== undefined;
    this.index = LEVELS.indexOf(forced ?? this.detect(gl));

    this.params = { level: "low", pixelRatio: 1, particles: 0, dustParticles: 0, stars: 0, bloom: false, textureSize: 0 };
    this.apply();
  }

  get current(): Readonly<QualityParams> {
    return this.params;
  }

  onChange(listener: Listener): void {
    this.listeners.push(listener);
  }

  sample(delta: number): void {
    if (this.locked || this.index === 0) return;
    if (delta > MAX_SAMPLE_DELTA) {
      this.resetSampling();
      return;
    }
    if (this.warmup > 0) {
      this.warmup -= delta;
      return;
    }

    this.windowTime += Math.min(delta, MAX_FRAME_WEIGHT);
    this.windowFrames++;
    if (this.windowTime < WINDOW_S) return;

    const fps = this.windowFrames / this.windowTime;
    this.windowTime = 0;
    this.windowFrames = 0;
    if (fps < TARGET_FPS) this.stepDown();
  }

  /** Tras una pausa o un cambio de nivel: descarta la medición en curso y vuelve a calentar. */
  resetSampling(): void {
    this.warmup = WARMUP_S;
    this.windowTime = 0;
    this.windowFrames = 0;
  }

  private stepDown(): void {
    if (this.index === 0) return;
    this.index--;
    this.apply();
    this.resetSampling();
    for (const listener of this.listeners) listener(this.params);
  }

  private apply(): void {
    const level = LEVELS[this.index] ?? "low";
    const preset = PRESETS[level];
    const deviceMaxDpr = this.isMobile ? 1.5 : 2;
    const p = this.params;
    p.level = level;
    p.pixelRatio = Math.min(window.devicePixelRatio || 1, deviceMaxDpr, preset.maxDpr);
    p.particles = preset.particles;
    p.dustParticles = preset.dustParticles;
    p.stars = preset.stars;
    p.bloom = level === "high" && !this.isMobile;
    p.textureSize = this.isMobile ? Math.min(preset.textureSize, 1024) : preset.textureSize;
  }

  private detect(gl: WebGLRenderingContext | WebGL2RenderingContext): QualityLevel {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory ?? 8;

    if (isSoftwareRenderer(gl) || cores <= 2 || memory <= 2) return "low";
    if (this.isMobile || cores <= 4 || memory <= 4) return "medium";
    return "high";
  }
}

function isSoftwareRenderer(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer: unknown = gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
  return typeof renderer === "string" && /swiftshader|llvmpipe|software|basic render/i.test(renderer);
}
