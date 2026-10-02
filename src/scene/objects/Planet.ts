import {
  AdditiveBlending,
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
import { Choreography } from "../choreography";
import type { QualityParams } from "../QualityManager";
import type { FrameContext, SceneObject } from "../SceneManager";
import atmosphereFrag from "../shaders/atmosphere.frag?raw";
import hologramFrag from "../shaders/hologram.frag?raw";
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
 * - La pose (posición, radio, eje, anillos, giro, capas) sale de `Choreography`, la tabla por
 *   sección. Encima se suman el giro por tiempo y el parallax del puntero.
 * - En el panel de "Sobre" se enciende la capa de holograma (malla + escaneo con `scroll.scan`).
 * - Con reduced motion `ctx.time` está congelado: pose fija (giro, luna y polvo quietos).
 */

const ATMOSPHERE_RADIUS = 1.14;
const BAND_INNER = 1.22;
const BAND_OUTER = 1.5;
const LINE_RADIUS = 1.62;
const MOON_ORBIT = 1.82;
const MOON_RADIUS = 0.09;
const SPIN_SPEED = 0.045;
const MOON_SPEED = 0.11;
const HOLOGRAM_RADIUS = 1.012;
const SHADOW_OPACITY = 0.4;
/** Margen (en radios) que ocupa el sistema completo: luna y polvo. */
const EXTENT = 2;
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
  private readonly choreography = new Choreography();
  private readonly uShadow = { value: SHADOW_OPACITY };
  private readonly uEnv = { value: 1 };
  private readonly uPanel = { value: 0 };
  private readonly uScan = { value: 0 };

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
        uniforms: { uMap: this.uMap, uLightDir: this.lightDir, uRimDir: this.rimDir, uEnv: this.uEnv },
      }),
    );
    this.spin.rotation.z = 0.32;
    this.spin.add(this.body);
    this.body.add(this.createHologram());
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
    this.choreography.update(ctx);
    const pose = this.choreography.pose;
    const extent = pose.r * EXTENT;
    const onScreen =
      Math.abs(pose.x) - extent < ctx.viewHalfWidth && Math.abs(pose.y) - extent < ctx.viewHalfHeight;
    this.root.visible = this.choreography.ready && pose.r > 1e-4 && onScreen;
    if (!this.root.visible) return;

    if (ctx.pointer.enabled && !ctx.reducedMotion) {
      const damp = 1 - Math.exp(-ctx.delta * 4);
      this.parallaxX += (ctx.pointer.x - this.parallaxX) * damp;
      this.parallaxY += (ctx.pointer.y - this.parallaxY) * damp;
    }
    // Dentro del panel el parallax se reduce para que el sistema no se salga de sus bordes.
    const parallax = PARALLAX * (1 - 0.7 * pose.panel);

    this.root.position.set(pose.x + this.parallaxX * parallax, pose.y + this.parallaxY * parallax, 0);
    this.root.scale.setScalar(pose.r);
    this.spin.rotation.z = pose.axis;

    this.body.rotation.y = 1.1 + pose.turn + ctx.time * SPIN_SPEED;
    this.rings.rotation.set(
      pose.ringTilt - this.parallaxY * PARALLAX_TILT,
      this.parallaxX * PARALLAX_TILT,
      pose.ringRoll,
    );
    this.moonSpin.rotation.z = 2.2 + ctx.time * MOON_SPEED;
    this.dust.update(ctx.time, pose.dust);

    this.uShadow.value = SHADOW_OPACITY * pose.shadow;
    this.uEnv.value = 1 - pose.panel;
    this.uPanel.value = pose.panel;
    this.uScan.value = ctx.scroll.scan;
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
        uniforms: { uOpacity: this.uShadow },
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

  /** Cáscara apenas mayor que el cuerpo; gira con él, así la malla queda fija a la superficie. */
  private createHologram(): Mesh {
    const hologram = new Mesh(
      this.track(new SphereGeometry(HOLOGRAM_RADIUS, 96, 64)),
      this.material({
        vertexShader: surfaceVert,
        fragmentShader: hologramFrag,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uMap: this.uMap, uScan: this.uScan, uPanel: this.uPanel },
      }),
    );
    hologram.renderOrder = 5;
    return hologram;
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
