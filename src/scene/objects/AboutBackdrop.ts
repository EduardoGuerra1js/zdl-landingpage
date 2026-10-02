import { Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from "three";
import { CAMERA_Z, type FrameContext, type SceneObject } from "../SceneManager";
import panelFrag from "../shaders/panel.frag?raw";
import ringVert from "../shaders/ring.vert?raw";

/**
 * Fondo oscuro del panel de "Sobre", dibujado en el canvas para que el planeta pueda entrar en él.
 * - Se alinea a `layout.about` (px de documento) menos `scroll.y`; nunca lee el DOM.
 * - Vive detrás del planeta (z = -DEPTH, escalado para cubrir los mismos px): el cuerpo opaco lo
 *   tapa por profundidad y las capas transparentes del planeta se pintan encima.
 * - Debe verse igual que el fondo CSS que sustituye (`.about__panel`, ver `sections.css`).
 */

const DEPTH = 6;
const DEPTH_SCALE = (CAMERA_Z + DEPTH) / CAMERA_Z;
/** `--radius-panel` y la celda de la retícula (2.5 rem), en px CSS. */
const RADIUS_PX = 32;
const CELL_PX = 40;
/** Margen del quad alrededor del panel para la sombra, en px. */
const PAD_PX = 64;

export class AboutBackdrop implements SceneObject {
  readonly root: Mesh;
  private readonly geometry = new PlaneGeometry(1, 1);
  private readonly material: ShaderMaterial;
  private readonly uQuad = { value: new Vector2(1, 1) };
  private readonly uHalf = { value: new Vector2(1, 1) };

  constructor() {
    this.material = new ShaderMaterial({
      vertexShader: ringVert,
      fragmentShader: panelFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uQuad: this.uQuad,
        uHalf: this.uHalf,
        uRadius: { value: RADIUS_PX },
        uCell: { value: CELL_PX },
      },
    });
    this.root = new Mesh(this.geometry, this.material);
    this.root.renderOrder = -1;
    this.root.frustumCulled = false;
  }

  update(ctx: FrameContext): void {
    const panel = ctx.layout.about;
    const top = panel.y - panel.height / 2 - ctx.scroll.y;
    const visible =
      panel.size > 0 && top - PAD_PX < ctx.viewportHeight && top + panel.height + PAD_PX > 0;
    this.root.visible = visible;
    if (!visible) return;

    const worldPerPx = ((2 * ctx.viewHalfHeight) / ctx.viewportHeight) * DEPTH_SCALE;
    const quadW = panel.width + 2 * PAD_PX;
    const quadH = panel.height + 2 * PAD_PX;
    this.uQuad.value.set(quadW, quadH);
    this.uHalf.value.set(panel.width / 2, panel.height / 2);
    this.root.scale.set(quadW * worldPerPx, quadH * worldPerPx, 1);
    this.root.position.set(
      (panel.x - ctx.viewportWidth / 2) * worldPerPx,
      (ctx.viewportHeight / 2 - (panel.y - ctx.scroll.y)) * worldPerPx,
      -DEPTH,
    );
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
