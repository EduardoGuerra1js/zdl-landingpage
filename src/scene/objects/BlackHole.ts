import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
} from "three";
import { finaleProgress, smoothstep } from "../finale";
import type { LensState } from "../post/LensPass";
import type { QualityParams } from "../QualityManager";
import { mulberry32 } from "../random";
import type { FrameContext, SceneObject } from "../SceneManager";
import blackhole from "../shaders/blackhole.glsl?raw";
import discFrag from "../shaders/bh-disc.frag?raw";
import horizonFrag from "../shaders/bh-horizon.frag?raw";
import lensFrag from "../shaders/bh-lens.frag?raw";
import particlesFrag from "../shaders/bh-particles.frag?raw";
import particlesVert from "../shaders/bh-particles.vert?raw";
import ringVert from "../shaders/ring.vert?raw";

/**
 * Agujero negro del CTA, anclado a `layout.cta` (`.cta__visual`). Unidades: radio del disco = 1.
 * - Horizonte negro que escribe profundidad (oculta la mitad trasera del disco).
 * - Disco de acreción: `quality.particles` puntos (9000/4000/1500) cuya posición, color y brillo
 *   se calculan en el vertex shader con rotación diferencial (dentro gira más rápido), más un
 *   cuerpo continuo procedural con estrías que giran igual.
 * - Lente gravitacional: arco de luz sobre el horizonte y anillo de fotones (un quad), más una
 *   segunda pasada de partículas con la imagen "lensada" del disco. Blending aditivo: luce porque
 *   vive sobre fondo oscuro (ver regla de marca).
 * - Aparece con el progreso del cierre (`finale.ts`), a la vez que el planeta cae dentro.
 * - Escribe `LensState`: en escritorio de calidad alta, `LensPass` distorsiona la pantalla.
 * Toda la animación va en la GPU y `update` no asigna.
 */

const MAX_PARTICLES = 9000;
/** Deben coincidir con `blackhole.glsl`. */
const R_IN = 0.36;
const R_OUT = 1;
/** Inclinación respecto a verlo de frente (rad): casi de canto, como en los renders clásicos. */
const TILT = 1.36;
/** Radio del disco = menor de (mitad del ancho) y (alto / esto): deja sitio al arco sobre el horizonte. */
const HEIGHT_FIT = 1.55;
const FILL = 0.96;
const LENS_STRENGTH = 0.28;
const LENS_RADIUS = 0.55;

export class BlackHole implements SceneObject {
  readonly root = new Group();
  private readonly geometry = new BufferGeometry();
  private readonly lensGeometry = new BufferGeometry();
  private readonly quadGeometries: PlaneGeometry[] = [];
  private readonly materials: ShaderMaterial[] = [];
  private readonly uTime = { value: 0 };
  private readonly uOpacity = { value: 0 };
  private readonly uPixelRatio = { value: 1 };
  private readonly uScalePx = { value: 240 };

  constructor(
    quality: Readonly<QualityParams>,
    private readonly lens: LensState,
  ) {
    const disk = new Float32Array(MAX_PARTICLES * 4);
    const random = mulberry32(0x5b5bf0);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      // Más densidad hacia dentro; el grosor crece hacia fuera.
      const radius = R_IN + (R_OUT - R_IN) * Math.pow(random(), 1.8);
      const t = (radius - R_IN) / (R_OUT - R_IN);
      disk[i * 4] = radius;
      disk[i * 4 + 1] = random() * Math.PI * 2;
      disk[i * 4 + 2] = (random() + random() - 1) * 0.035 * (0.4 + t);
      disk[i * 4 + 3] = random();
    }
    const diskAttribute = new BufferAttribute(disk, 4);
    const positions = new BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3);
    this.geometry.setAttribute("position", positions);
    this.geometry.setAttribute("aDisk", diskAttribute);
    // La pasada lensada reutiliza los mismos buffers y solo dibuja la mitad.
    this.lensGeometry.setAttribute("position", positions);
    this.lensGeometry.setAttribute("aDisk", diskAttribute);

    const horizon = this.quad(2, horizonFrag, { transparent: true, depthWrite: true }, 10);

    const lensQuad = this.quad(2.6, lensFrag, { transparent: true, depthWrite: false, blending: AdditiveBlending }, 11);
    lensQuad.position.z = -0.02;

    // El plano del disco se inclina hacia la cámara; su mitad trasera queda detrás del horizonte.
    const tilted = new Group();
    tilted.rotation.x = -TILT;
    tilted.add(this.quad(2, discFrag, { transparent: true, depthWrite: false, blending: AdditiveBlending }, 12));

    this.root.add(
      horizon,
      lensQuad,
      tilted,
      this.points(this.geometry, 0, 13),
      this.points(this.lensGeometry, 1, 14),
    );
    this.root.visible = false;
    this.onQualityChange(quality);
  }

  update(ctx: FrameContext): void {
    const rect = ctx.layout.cta;
    const vw = ctx.viewportWidth;
    const vh = ctx.viewportHeight;
    const appear = smoothstep(0.05, 0.5, finaleProgress(ctx.layout, ctx.scroll.y));
    const centerY = rect.y - ctx.scroll.y;
    const margin = rect.height * 0.5 + 40;
    const visible = rect.size > 0 && appear > 0.002 && centerY + margin > 0 && centerY - margin < vh;
    this.root.visible = visible;
    if (!visible) {
      this.lens.strength = 0;
      return;
    }

    const unitPx = Math.min(rect.width / 2, rect.height / HEIGHT_FIT) * FILL * (0.8 + 0.2 * appear);
    const worldPerPx = (2 * ctx.viewHalfHeight) / vh;
    this.root.position.set((rect.x - vw / 2) * worldPerPx, (vh / 2 - centerY) * worldPerPx, 0);
    this.root.scale.setScalar(unitPx * worldPerPx);

    this.uTime.value = ctx.time;
    this.uOpacity.value = appear;
    this.uScalePx.value = unitPx;

    this.lens.strength = LENS_STRENGTH * appear;
    this.lens.x = rect.x / vw;
    this.lens.y = 1 - centerY / vh;
    this.lens.radius = (unitPx * LENS_RADIUS) / vh;
  }

  onQualityChange(params: Readonly<QualityParams>): void {
    const count = Math.min(MAX_PARTICLES, params.particles);
    this.geometry.setDrawRange(0, count);
    this.lensGeometry.setDrawRange(0, Math.max(1, count >> 1));
    this.uPixelRatio.value = params.pixelRatio;
  }

  dispose(): void {
    this.geometry.dispose();
    this.lensGeometry.dispose();
    for (const geometry of this.quadGeometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
  }

  private quad(
    size: number,
    fragmentShader: string,
    options: ConstructorParameters<typeof ShaderMaterial>[0],
    renderOrder: number,
  ): Mesh {
    const geometry = new PlaneGeometry(size, size);
    this.quadGeometries.push(geometry);
    const material = new ShaderMaterial({
      vertexShader: ringVert,
      fragmentShader: blackhole + fragmentShader,
      uniforms: { uTime: this.uTime, uOpacity: this.uOpacity },
      ...options,
    });
    this.materials.push(material);
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = renderOrder;
    return mesh;
  }

  private points(geometry: BufferGeometry, lensed: number, renderOrder: number): Points {
    const material = new ShaderMaterial({
      vertexShader: blackhole + particlesVert,
      fragmentShader: particlesFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: this.uTime,
        uOpacity: this.uOpacity,
        uPixelRatio: this.uPixelRatio,
        uScalePx: this.uScalePx,
        uTilt: { value: TILT },
        uLens: { value: lensed },
      },
    });
    this.materials.push(material);
    const points = new Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = renderOrder;
    return points;
  }
}