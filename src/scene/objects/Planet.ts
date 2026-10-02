import {
  BackSide,
  DoubleSide,
  Group,
  Mesh,
  PlaneGeometry,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from "three";
import type { QualityParams } from "../QualityManager";
import type { FrameContext, SceneObject } from "../SceneManager";
import atmosphereFrag from "../shaders/atmosphere.frag?raw";
import moonFrag from "../shaders/moon.frag?raw";
import planetFrag from "../shaders/planet.frag?raw";
import ringFrag from "../shaders/ring.frag?raw";
import ringVert from "../shaders/ring.vert?raw";
import shadowFrag from "../shaders/shadow.frag?raw";
import surfaceVert from "../shaders/surface.vert?raw";
import { bakePlanetTexture } from "../textures/bakePlanetTexture";
import { Dust } from "./Dust";

/**
 * Planeta del hero: obsidiana pulida con rim índigo, atmósfera fresnel (blending normal), sombra
 * suave, banda translúcida, anillo de línea, luna y polvo.
 * - Todo vive en unidades de radio del planeta; `root` se escala al radio en mundo.
 * - Se coloca sobre `.hero__visual .planet-ph` a partir de `layoutState` + `scrollState.y`, así
 *   que coincide con el marcador CSS y sube con el hero. La coreografía por sección es de la Fase 4.
 * - Con reduced motion `ctx.time` está congelado: pose fija (giro, luna y polvo quietos).
 */

/** Radio del cuerpo respecto al lado del marcador (`.planet-ph__body` tiene `inset: 20%`). */
const BODY_FRACTION = 0.3;
const ATMOSPHERE_RADIUS = 1.14;
const BAND_INNER = 1.22;
const BAND_OUTER = 1.5;
const LINE_RADIUS = 1.62;
const MOON_ORBIT = 1.82;
const MOON_RADIUS = 0.09;
const SPIN_SPEED = 0.045;
const MOON_SPEED = 0.11;
/** Desplazamiento máximo del parallax (unidades de mundo) y giro extra de los anillos (rad). */
const PARALLAX = 0.25;
const PARALLAX_TILT = 0.08;

const ACCENT = new Vector3(0.357, 0.357, 0.941);

export class Planet implements SceneObject {
  readonly root = new Group();
  private readonly spin = new Group();
  private readonly body: Mesh;
  private readonly rings = new Group();
  private readonly moonSpin = new Group();
  private readonly dust: Dust;

  private readonly geometries: { dispose(): void }[] = [];
  private readonly materials: ShaderMaterial[] = [];
  private readonly uMap = { value: null as WebGLRenderTarget["texture"] | null };
  private readonly lightDir = { value: new Vector3(-0.55, 0.62, 0.56).normalize() };
  private readonly rimDir = { value: new Vector3(0.88, -0.42, -0.22).normalize() };

  private bake: WebGLRenderTarget;
  private bakedSize: number;
  private parallaxX = 0;
  private parallaxY = 0;

  constructor(
    private readonly renderer: WebGLRenderer,
    quality: Readonly<QualityParams>,
  ) {
    this.bakedSize = quality.textureSize;
    this.bake = bakePlanetTexture(renderer, this.bakedSize);
    this.uMap.value = this.bake.texture;

    this.root.add(this.createShadow());

    this.body = new Mesh(
      this.track(new SphereGeometry(1, 96, 64)),
      this.material({
        vertexShader: surfaceVert,
        fragmentShader: planetFrag,
        uniforms: { uMap: this.uMap, uLightDir: this.lightDir, uRimDir: this.rimDir },
      }),
    );
    this.spin.rotation.z = 0.32;
    this.spin.add(this.body);
    this.root.add(this.spin);

    const atmosphere = new Mesh(
      this.track(new SphereGeometry(ATMOSPHERE_RADIUS, 64, 32)),
      this.material({
        vertexShader: surfaceVert,
        fragmentShader: atmosphereFrag,
        side: BackSide,
        transparent: true,
        depthWrite: false,
        uniforms: { uInner: { value: 1 / ATMOSPHERE_RADIUS }, uOpacity: { value: 0.3 }, uRimDir: this.rimDir },
      }),
    );
    atmosphere.renderOrder = 1;
    this.root.add(atmosphere);

    this.rings.add(
      this.createRing(BAND_INNER, BAND_OUTER, 0.26, false, -1.32, 0.24),
      this.createRing(LINE_RADIUS - 0.1, LINE_RADIUS + 0.1, 0.75, true, -1.27, 0.3),
      this.createMoon(),
    );
    this.root.add(this.rings);

    this.dust = new Dust(quality);
    const dustTilt = new Group();
    dustTilt.rotation.z = 0.24;
    dustTilt.rotation.x = -1.32 + Math.PI / 2;
    dustTilt.add(this.dust.points);
    this.rings.add(dustTilt);
  }

  update(ctx: FrameContext): void {
    const hero = ctx.layout.hero;
    if (hero.size <= 0 || ctx.viewportHeight <= 0) {
      this.root.visible = false;
      return;
    }

    const worldPerPx = (2 * ctx.viewHalfHeight) / ctx.viewportHeight;
    const radius = hero.size * BODY_FRACTION * worldPerPx;
    const x = (hero.x - ctx.viewportWidth / 2) * worldPerPx;
    const y = (ctx.viewportHeight / 2 - (hero.y - ctx.scroll.y)) * worldPerPx;

    if (ctx.pointer.enabled && !ctx.reducedMotion) {
      const damp = 1 - Math.exp(-ctx.delta * 4);
      this.parallaxX += (ctx.pointer.x - this.parallaxX) * damp;
      this.parallaxY += (ctx.pointer.y - this.parallaxY) * damp;
    }

    this.root.visible = y - radius * MOON_ORBIT < ctx.viewHalfHeight;
    this.root.position.set(x + this.parallaxX * PARALLAX, y + this.parallaxY * PARALLAX, 0);
    this.root.scale.setScalar(radius);

    this.body.rotation.y = 1.1 + ctx.time * SPIN_SPEED;
    this.rings.rotation.set(-this.parallaxY * PARALLAX_TILT, this.parallaxX * PARALLAX_TILT, 0);
    this.moonSpin.rotation.z = 2.2 + ctx.time * MOON_SPEED;
    this.dust.update(ctx.time);
  }

  onQualityChange(params: Readonly<QualityParams>): void {
    this.dust.setQuality(params);
    if (params.textureSize === this.bakedSize) return;
    const previous = this.bake;
    this.bakedSize = params.textureSize;
    this.bake = bakePlanetTexture(this.renderer, this.bakedSize);
    this.uMap.value = this.bake.texture;
    previous.dispose();
  }

  dispose(): void {
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.dust.dispose();
    this.bake.dispose();
  }

  /** Mancha gaussiana detrás y debajo del cuerpo: la sombra que cae sobre el papel. */
  private createShadow(): Mesh {
    const shadow = new Mesh(
      this.track(new PlaneGeometry(2, 2)),
      this.material({
        vertexShader: ringVert,
        fragmentShader: shadowFrag,
        transparent: true,
        depthWrite: false,
        uniforms: { uOpacity: { value: 0.4 } },
      }),
    );
    shadow.position.set(0.12, -0.55, -1.6);
    shadow.scale.set(2.5, 1.6, 1);
    shadow.renderOrder = 0;
    return shadow;
  }

  /** Anillo inclinado: `tiltX` lo acerca al canto y `roll` lo gira en el plano de pantalla. */
  private createRing(inner: number, outer: number, opacity: number, line: boolean, tiltX: number, roll: number): Group {
    const ring = new Mesh(
      this.track(new RingGeometry(inner, outer, 192, 1)),
      this.material({
        vertexShader: ringVert,
        fragmentShader: ringFrag,
        side: DoubleSide,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uInner: { value: line ? (inner + outer) / 2 : inner },
          uOuter: { value: outer },
          uOpacity: { value: opacity },
          uLine: { value: line ? 1 : 0 },
          uColor: { value: ACCENT },
        },
      }),
    );
    ring.rotation.x = tiltX;
    ring.renderOrder = line ? 3 : 2;
    const pivot = new Group();
    pivot.rotation.z = roll;
    pivot.add(ring);
    return pivot;
  }

  private createMoon(): Group {
    const moon = new Mesh(
      this.track(new SphereGeometry(1, 32, 16)),
      this.material({
        vertexShader: surfaceVert,
        fragmentShader: moonFrag,
        uniforms: { uLightDir: this.lightDir, uRimDir: this.rimDir },
      }),
    );
    moon.scale.setScalar(MOON_RADIUS);
    moon.position.x = MOON_ORBIT;
    this.moonSpin.add(moon);

    const plane = new Group();
    plane.rotation.x = -1.12;
    plane.add(this.moonSpin);
    const pivot = new Group();
    pivot.rotation.z = 0.42;
    pivot.add(plane);
    return pivot;
  }

  private track<T extends { dispose(): void }>(geometry: T): T {
    this.geometries.push(geometry);
    return geometry;
  }

  private material(params: ConstructorParameters<typeof ShaderMaterial>[0]): ShaderMaterial {
    const material = new ShaderMaterial(params);
    this.materials.push(material);
    return material;
  }
}
