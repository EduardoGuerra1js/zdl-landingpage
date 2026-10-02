import {
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  WebGLRenderTarget,
  type WebGLRenderer,
} from "three";
import bakeFrag from "../shaders/bake.frag?raw";
import fullscreenVert from "../shaders/fullscreen.vert?raw";
import noise from "../shaders/noise.glsl?raw";

/**
 * Hornea una sola vez, en la GPU, el mapa del planeta (normal con relieve + vetas) en un
 * render target equirectangular de `size × size/2`. Cuesta un pase al crearlo y cero por frame.
 */
export function bakePlanetTexture(renderer: WebGLRenderer, size: number): WebGLRenderTarget {
  const target = new WebGLRenderTarget(size, size / 2, {
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });
  target.texture.wrapS = RepeatWrapping;
  target.texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    vertexShader: fullscreenVert,
    fragmentShader: noise + bakeFrag,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new Mesh(geometry, material);
  quad.frustumCulled = false;

  const previous = renderer.getRenderTarget();
  renderer.setRenderTarget(target);
  renderer.render(quad, new OrthographicCamera());
  renderer.setRenderTarget(previous);

  geometry.dispose();
  material.dispose();
  return target;
}
