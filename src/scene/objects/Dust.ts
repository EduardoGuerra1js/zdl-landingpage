import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three";
import type { QualityParams } from "../QualityManager";
import { mulberry32 } from "../random";
import dustFrag from "../shaders/dust.frag?raw";
import dustVert from "../shaders/dust.vert?raw";

/**
 * Polvo muy leve alrededor del planeta, en unidades de radio del planeta (lo escala el padre).
 * El buffer se reserva una vez para el máximo y la calidad solo mueve `drawRange`.
 */
const MAX_PARTICLES = 600;
const INNER = 1.25;
const OUTER = 1.95;
const OPACITY = 0.5;

export class Dust {
  readonly points: Points;
  private readonly geometry = new BufferGeometry();
  private readonly material: ShaderMaterial;
  private readonly uTime = { value: 0 };
  private readonly uPixelRatio = { value: 1 };
  private readonly uOpacity = { value: OPACITY };

  constructor(quality: Readonly<QualityParams>) {
    const orbit = new Float32Array(MAX_PARTICLES * 4);
    const look = new Float32Array(MAX_PARTICLES * 2);
    const random = mulberry32(0x5b5bf0);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const shell = random() < 0.25;
      const radius = INNER + (OUTER - INNER) * Math.pow(random(), 0.8);
      const spread = shell ? 0.9 : 0.12;
      orbit[i * 4] = radius;
      orbit[i * 4 + 1] = random() * Math.PI * 2;
      orbit[i * 4 + 2] = (random() + random() + random() - 1.5) * spread;
      orbit[i * 4 + 3] = 0.03 + random() * 0.05;
      look[i * 2] = 1 + random() * 1.6;
      look[i * 2 + 1] = random() < 0.6 ? 1 : 0;
    }

    this.geometry.setAttribute("position", new BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3));
    this.geometry.setAttribute("aOrbit", new BufferAttribute(orbit, 4));
    this.geometry.setAttribute("aLook", new BufferAttribute(look, 2));

    this.material = new ShaderMaterial({
      vertexShader: dustVert,
      fragmentShader: dustFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: this.uTime,
        uPixelRatio: this.uPixelRatio,
        uOpacity: this.uOpacity,
      },
    });

    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 4;
    this.setQuality(quality);
  }

  /** `fade` multiplica la opacidad base (la coreografía atenúa el polvo por sección). */
  update(time: number, fade: number): void {
    this.uTime.value = time;
    this.uOpacity.value = OPACITY * fade;
  }

  setQuality(quality: Readonly<QualityParams>): void {
    this.geometry.setDrawRange(0, Math.min(MAX_PARTICLES, quality.dustParticles));
    this.uPixelRatio.value = quality.pixelRatio;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}