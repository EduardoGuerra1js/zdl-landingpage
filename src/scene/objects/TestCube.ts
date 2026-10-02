import {
  BoxGeometry,
  DirectionalLight,
  EdgesGeometry,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
} from "three";
import type { FrameContext, SceneObject } from "../SceneManager";
import { SECTION_IDS } from "../ScrollState";

/**
 * Objeto TEMPORAL de la Fase 2 para validar la arquitectura; la Fase 3 lo sustituye por el planeta.
 * Lee el progreso de página, la sección "Qué hacemos", la velocidad y el puntero.
 * Con reduced motion adopta una pose fija por sección activa.
 */
export class TestCube implements SceneObject {
  readonly root = new Group();
  private readonly pivot = new Group();
  private readonly geometry = new BoxGeometry(1.4, 1.4, 1.4);
  private readonly edgesGeometry = new EdgesGeometry(this.geometry);
  private readonly material = new MeshStandardMaterial({ color: 0x2a2c6e, roughness: 0.45, metalness: 0.2 });
  private readonly edgeMaterial = new LineBasicMaterial({ color: 0x5b5bf0 });
  private homeX = 0;
  private homeY = 0;
  private tilt = 0;
  private parallaxX = 0;
  private parallaxY = 0;

  constructor() {
    const mesh = new Mesh(this.geometry, this.material);
    mesh.add(new LineSegments(this.edgesGeometry, this.edgeMaterial));
    this.pivot.add(mesh);

    const key = new DirectionalLight(0xffffff, 2.2);
    key.position.set(-3, 4, 5);
    const rim = new DirectionalLight(0x5b5bf0, 3);
    rim.position.set(4, -1, -3);
    this.root.add(this.pivot, key, rim, new HemisphereLight(0xe8e8fa, 0x14163a, 0.8));
  }

  /** Escritorio: a la derecha del titular. Móvil (vertical): arriba, centrado. */
  onResize(ctx: FrameContext): void {
    const landscape = ctx.viewHalfWidth >= ctx.viewHalfHeight;
    this.homeX = landscape ? ctx.viewHalfWidth * 0.45 : 0;
    this.homeY = landscape ? 0 : ctx.viewHalfHeight * 0.55;
  }

  update(ctx: FrameContext): void {
    const p = this.pivot;

    if (ctx.reducedMotion) {
      const step = ctx.scroll.active / (SECTION_IDS.length - 1);
      p.position.set(this.homeX * Math.cos(step * Math.PI * 2), this.homeY, 0);
      p.rotation.set(0.4, ctx.scroll.active * (Math.PI / 4), 0);
      p.scale.setScalar(1);
      return;
    }

    const damp = 1 - Math.exp(-ctx.delta * 6);
    const targetTilt = Math.min(0.5, Math.max(-0.5, ctx.scroll.velocity * 0.01));
    this.tilt += (targetTilt - this.tilt) * damp;
    this.parallaxX += (ctx.pointer.x * 0.4 - this.parallaxX) * damp;
    this.parallaxY += (ctx.pointer.y * 0.4 - this.parallaxY) * damp;

    const page = ctx.scroll.page;
    const shrink = smoothstep(ctx.scroll.sections["que-hacemos"]);

    p.position.set(this.homeX * Math.cos(page * Math.PI * 2) + this.parallaxX, this.homeY + this.parallaxY, 0);
    p.rotation.set(0.4 + this.tilt, page * Math.PI * 4 + ctx.time * 0.3, 0);
    p.scale.setScalar(1 - 0.35 * shrink);
  }

  dispose(): void {
    this.geometry.dispose();
    this.edgesGeometry.dispose();
    this.material.dispose();
    this.edgeMaterial.dispose();
  }
}

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}
