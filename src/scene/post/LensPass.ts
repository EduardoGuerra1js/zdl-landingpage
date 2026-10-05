import {
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  type Camera,
  type Scene,
  type WebGLRenderer,
} from "three";
import type { QualityParams } from "../QualityManager";
import type { PostPass } from "../SceneManager";
import fullscreenVert from "../shaders/fullscreen.vert?raw";
import lensFrag from "../shaders/lens.frag?raw";

/**
 * Distorsión de pantalla del agujero negro: un único pase de pantalla completa que empuja hacia
 * fuera lo que hay alrededor del horizonte (estrellas, disco, planeta cayendo).
 * - Solo escritorio en nivel alto (`quality.bloom`). En móvil o al bajar de nivel no hay pase.
 * - Es barato porque solo existe mientras el agujero negro está en pantalla: el resto del tiempo
 *   la escena se dibuja directo al lienzo y el render target ni siquiera está reservado.
 * - `BlackHole` escribe `LensState` en cada frame; este pase solo lo lee.
 */

export interface LensState {
  /** 0 = apagado. */
  strength: number;
  /** Centro del agujero en UV del lienzo (origen abajo a la izquierda). */
  x: number;
  y: number;
  /** Radio de influencia, en fracción del alto del lienzo. */
  radius: number;
}

export function createLensState(): LensState {
  return { strength: 0, x: 0.5, y: 0.5, radius: 0.2 };
}

const TARGET_SCALE = 0.75;
const MSAA_SAMPLES = 2;

export class LensPass implements PostPass {
  private enabled = false;
  private target: WebGLRenderTarget | null = null;
  private readonly size = new Vector2();
  private readonly geometry = new PlaneGeometry(2, 2);
  private readonly camera = new OrthographicCamera();
  private readonly material: ShaderMaterial;
  private readonly screen: Mesh;
  private readonly uCenter = { value: new Vector2() };
  private readonly uMap = { value: null as WebGLRenderTarget["texture"] | null };
  private readonly uRadius = { value: 0.2 };
  private readonly uStrength = { value: 0 };
  private readonly uAspect = { value: 1 };

  constructor(private readonly lens: Readonly<LensState>) {
    this.material = new ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: lensFrag,
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tMap: this.uMap,
        uCenter: this.uCenter,
        uRadius: this.uRadius,
        uStrength: this.uStrength,
        uAspect: this.uAspect,
      },
    });
    this.screen = new Mesh(this.geometry, this.material);
    this.screen.frustumCulled = false;
  }

  get active(): boolean {
    return this.enabled && this.lens.strength > 0.01;
  }

  onQualityChange(params: Readonly<QualityParams>): void {
    this.enabled = params.bloom;
    if (!this.enabled) this.release();
  }

  render(renderer: WebGLRenderer, scene: Scene, camera: Camera): void {
    renderer.getDrawingBufferSize(this.size);
    const width = Math.max(1, Math.round(this.size.x * TARGET_SCALE));
    const height = Math.max(1, Math.round(this.size.y * TARGET_SCALE));

    if (!this.target) {
      this.target = new WebGLRenderTarget(width, height, { samples: MSAA_SAMPLES });
      this.uMap.value = this.target.texture;
    } else if (this.target.width !== width || this.target.height !== height) {
      this.target.setSize(width, height);
    }

    renderer.setRenderTarget(this.target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    this.uCenter.value.set(this.lens.x, this.lens.y);
    this.uRadius.value = this.lens.radius;
    this.uStrength.value = this.lens.strength;
    this.uAspect.value = width / height;
    renderer.render(this.screen, this.camera);
  }

  /** Libera el render target cuando el pase no se usa. */
  release(): void {
    if (!this.target) return;
    this.target.dispose();
    this.target = null;
    this.uMap.value = null;
  }

  dispose(): void {
    this.release();
    this.geometry.dispose();
    this.material.dispose();
  }
}
