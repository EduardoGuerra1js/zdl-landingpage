import { PerspectiveCamera, Scene, WebGLRenderer, type Object3D } from "three";
import type { LayoutData } from "./LayoutState";
import type { PointerData } from "./PointerState";
import { QualityManager, type QualityParams } from "./QualityManager";
import type { ScrollStateData } from "./ScrollState";

/**
 * Contrato: dueño del único canvas y del único renderer.
 * - Canvas fijo a pantalla completa, detrás del contenido, con fondo transparente (alpha).
 * - Tamaño solo vía ResizeObserver; nunca lee layout dentro del bucle.
 * - Cada frame arma un `FrameContext` reutilizado (cero asignaciones) y lo pasa a cada objeto.
 * - Pausa con motivos acumulables: con cualquier motivo activo no hay rAF.
 * - Con reduced motion el tiempo se congela y solo se renderiza cuando cambian el scroll,
 *   el layout, el tamaño o la calidad: la escena acompaña al contenido como una imagen fija.
 */

export interface FrameContext {
  /** Segundos acumulados de render (congelado con reduced motion). */
  time: number;
  /** Segundos desde el frame anterior, con tope de 0.1. 0 con reduced motion. */
  delta: number;
  scroll: Readonly<ScrollStateData>;
  pointer: Readonly<PointerData>;
  layout: Readonly<LayoutData>;
  quality: Readonly<QualityParams>;
  reducedMotion: boolean;
  /** Semiancho y semialto visibles en el plano z = 0, en unidades de mundo. */
  viewHalfWidth: number;
  viewHalfHeight: number;
  /** Tamaño CSS del canvas en px (el canvas empieza en y = 0 del viewport). */
  viewportWidth: number;
  viewportHeight: number;
}

export interface SceneObject {
  readonly root: Object3D;
  update(ctx: FrameContext): void;
  onResize?(ctx: FrameContext): void;
  onQualityChange?(params: Readonly<QualityParams>): void;
  dispose(): void;
}

export type PauseReason = "hidden" | "offscreen" | "context-lost";

export interface SceneManagerOptions {
  scroll: Readonly<ScrollStateData>;
  pointer: Readonly<PointerData>;
  layout: Readonly<LayoutData>;
  reducedMotion: boolean;
  onContextLost?: () => void;
}

const CAMERA_FOV = 35;
const CAMERA_Z = 10;
const MAX_DELTA = 0.1;

export class SceneManager {
  readonly canvas: HTMLCanvasElement;
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  readonly quality: QualityManager;

  private readonly objects: SceneObject[] = [];
  private readonly pauses = new Set<PauseReason>();
  private readonly ctx: FrameContext;
  private readonly resizeObserver: ResizeObserver;
  private rafId = 0;
  private lastNow = -1;
  private needsRender = true;
  private renderedScrollVersion = -1;
  private renderedLayoutVersion = -1;
  private width = 1;
  private height = 1;

  constructor(canvas: HTMLCanvasElement, private readonly options: SceneManagerOptions) {
    this.canvas = canvas;
    const coarse = matchMedia("(pointer: coarse)").matches;
    // El antialias no se puede cambiar después; en pantallas densas o táctiles no compensa.
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !coarse && window.devicePixelRatio < 2,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);

    this.quality = new QualityManager(this.renderer.getContext());
    this.renderer.setPixelRatio(this.quality.current.pixelRatio);
    this.quality.onChange(this.handleQualityChange);

    this.camera.position.z = CAMERA_Z;

    this.ctx = {
      time: 0,
      delta: 0,
      scroll: options.scroll,
      pointer: options.pointer,
      layout: options.layout,
      quality: this.quality.current,
      reducedMotion: options.reducedMotion,
      viewHalfWidth: 1,
      viewHalfHeight: 1,
      viewportWidth: 1,
      viewportHeight: 1,
    };

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(canvas);
    this.setSize(canvas.clientWidth, canvas.clientHeight);

    document.addEventListener("visibilitychange", this.handleVisibility);
    canvas.addEventListener("webglcontextlost", this.handleContextLost);
    if (document.hidden) this.pauses.add("hidden");
  }

  add(object: SceneObject): void {
    this.objects.push(object);
    this.scene.add(object.root);
    object.onResize?.(this.ctx);
    this.needsRender = true;
  }

  start(): void {
    if (this.rafId || this.pauses.size > 0) return;
    this.lastNow = -1;
    this.quality.resetSampling();
    this.rafId = requestAnimationFrame(this.tick);
  }

  pause(reason: PauseReason): void {
    this.pauses.add(reason);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  resume(reason: PauseReason): void {
    this.pauses.delete(reason);
    this.needsRender = true;
    this.start();
  }

  setReducedMotion(reduced: boolean): void {
    this.ctx.reducedMotion = reduced;
    this.needsRender = true;
  }

  dispose(): void {
    this.pause("hidden");
    this.resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    for (const object of this.objects) object.dispose();
    this.objects.length = 0;
    this.renderer.dispose();
  }

  private tick = (now: number): void => {
    this.rafId = requestAnimationFrame(this.tick);

    const rawDelta = this.lastNow < 0 ? 0 : (now - this.lastNow) / 1000;
    this.lastNow = now;
    const ctx = this.ctx;

    if (ctx.reducedMotion) {
      const unchanged =
        ctx.scroll.version === this.renderedScrollVersion && ctx.layout.version === this.renderedLayoutVersion;
      if (!this.needsRender && unchanged) return;
      ctx.delta = 0;
    } else {
      ctx.delta = Math.min(rawDelta, MAX_DELTA);
      ctx.time += ctx.delta;
      if (rawDelta > 0) this.quality.sample(rawDelta);
    }

    for (const object of this.objects) object.update(ctx);
    this.renderer.render(this.scene, this.camera);
    this.needsRender = false;
    this.renderedScrollVersion = ctx.scroll.version;
    this.renderedLayoutVersion = ctx.layout.version;
  };

  private setSize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.ctx.viewHalfHeight = Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180) * CAMERA_Z;
    this.ctx.viewHalfWidth = this.ctx.viewHalfHeight * this.camera.aspect;
    this.ctx.viewportWidth = this.width;
    this.ctx.viewportHeight = this.height;

    for (const object of this.objects) object.onResize?.(this.ctx);
    this.needsRender = true;
  }

  private handleResize = (entries: ResizeObserverEntry[]): void => {
    const box = entries[0]?.contentRect;
    if (box) this.setSize(box.width, box.height);
  };

  private handleQualityChange = (params: Readonly<QualityParams>): void => {
    this.renderer.setPixelRatio(params.pixelRatio);
    this.renderer.setSize(this.width, this.height, false);
    for (const object of this.objects) object.onQualityChange?.(params);
    this.needsRender = true;
  };

  private handleVisibility = (): void => {
    if (document.hidden) this.pause("hidden");
    else this.resume("hidden");
  };

  /** La pérdida de contexto se trata como definitiva: la página pasa al fallback estático. */
  private handleContextLost = (): void => {
    this.pause("context-lost");
    this.options.onContextLost?.();
  };
}
