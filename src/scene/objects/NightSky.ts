import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import type { QualityParams } from "../QualityManager";
import { mulberry32 } from "../random";
import type { FrameContext, SceneObject } from "../SceneManager";
import starsFrag from "../shaders/stars.frag?raw";
import starsVert from "../shaders/stars.vert?raw";
import veilFrag from "../shaders/veil.frag?raw";
import veilVert from "../shaders/veil.vert?raw";

/**
 * Cielo del cierre: el velo que lleva el fondo de papel a #07061A y las estrellas que aparecen
 * dentro de lo oscuro. La rampa del velo está anclada a la página (borde superior de la isla
 * oscura medido en `layout`), así que la mueve el scroll y no hay animación por tiempo.
 * - Con `has-webgl`, `.scene-ready .dark-island` del CSS es transparente y esto ocupa su lugar.
 * - Los textos del CTA empiezan más abajo de la rampa (`padding-top` de `.cta`): la legibilidad AA
 *   en el punto medio no depende de que el velo ya sea del todo opaco.
 * - Estrellas: buffer fijo para el máximo; la calidad solo mueve `drawRange`. Todo en la GPU.
 */

const MAX_STARS = 700;
/** Rampa del velo respecto al borde de la isla, en fracción del alto del viewport. */
const RAMP_BEFORE = 0.05;
const RAMP_AFTER = 0.2;
/** Parallax de las estrellas respecto al scroll (fracción de lo que se mueve el contenido). */
const STAR_PARALLAX = 0.1;

export class NightSky implements SceneObject {
  readonly root = new Group();
  private readonly veilGeometry = new PlaneGeometry(2, 2);
  private readonly veilMaterial: ShaderMaterial;
  private readonly starGeometry = new BufferGeometry();
  private readonly starMaterial: ShaderMaterial;
  private readonly uRamp = { value: new Vector2(0, 1) };
  private readonly uViewH = { value: 1 };
  private readonly uTime = { value: 0 };
  private readonly uShift = { value: 0 };
  private readonly uPixelRatio = { value: 1 };

  constructor(quality: Readonly<QualityParams>) {
    this.veilMaterial = new ShaderMaterial({
      vertexShader: veilVert,
      fragmentShader: veilFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uRamp: this.uRamp,
        uViewH: this.uViewH,
        uColor: { value: new Vector3(0.027, 0.024, 0.102) }, // --space #07061A
      },
    });
    const veil = new Mesh(this.veilGeometry, this.veilMaterial);
    veil.frustumCulled = false;
    veil.renderOrder = -10;

    const stars = new Float32Array(MAX_STARS * 4);
    const random = mulberry32(0x07061a);
    for (let i = 0; i < MAX_STARS; i++) {
      stars[i * 4] = random() * 2 - 1;
      stars[i * 4 + 1] = random() * 2 - 1;
      stars[i * 4 + 2] = 1.2 + Math.pow(random(), 3) * 3;
      stars[i * 4 + 3] = random();
    }
    this.starGeometry.setAttribute("position", new BufferAttribute(new Float32Array(MAX_STARS * 3), 3));
    this.starGeometry.setAttribute("aStar", new BufferAttribute(stars, 4));
    this.starMaterial = new ShaderMaterial({
      vertexShader: starsVert,
      fragmentShader: starsFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: this.uTime,
        uPixelRatio: this.uPixelRatio,
        uOpacity: { value: 1 },
        uViewH: this.uViewH,
        uShift: this.uShift,
        uRamp: this.uRamp,
      },
    });
    const points = new Points(this.starGeometry, this.starMaterial);
    points.frustumCulled = false;
    points.renderOrder = -9;

    this.root.add(veil, points);
    this.onQualityChange(quality);
  }

  update(ctx: FrameContext): void {
    const island = ctx.layout.sections.contacto;
    const vh = ctx.viewportHeight;
    if (island.height <= 0 || vh <= 1) {
      this.root.visible = false;
      return;
    }
    const top = island.top - ctx.scroll.y;
    const y0 = top - RAMP_BEFORE * vh;
    this.root.visible = y0 < vh;
    if (!this.root.visible) return;

    this.uRamp.value.set(y0, top + RAMP_AFTER * vh);
    this.uViewH.value = vh;
    this.uTime.value = ctx.time;
    this.uShift.value = (ctx.scroll.y / vh) * 2 * STAR_PARALLAX;
  }

  onQualityChange(params: Readonly<QualityParams>): void {
    this.starGeometry.setDrawRange(0, Math.min(MAX_STARS, params.stars));
    this.uPixelRatio.value = params.pixelRatio;
  }

  dispose(): void {
    this.veilGeometry.dispose();
    this.veilMaterial.dispose();
    this.starGeometry.dispose();
    this.starMaterial.dispose();
  }
}