// Estrellas en espacio de pantalla, animadas en la GPU. aStar = (x, y en NDC, tamaño px, semilla).
// Solo se ven donde el velo ya es oscuro; el scroll las desplaza con parallax según su "profundidad".
attribute vec4 aStar;

uniform float uTime;
uniform float uPixelRatio;
uniform float uOpacity;
uniform float uViewH;
uniform float uShift;  // desplazamiento vertical por scroll, en NDC
uniform vec2 uRamp;

varying float vAlpha;
varying float vTone;

void main() {
  float depth = 0.25 + 0.75 * fract(aStar.w * 7.31);
  float y = mod(aStar.y + uShift * depth + 1.0, 2.0) - 1.0;
  float py = (1.0 - y) * 0.5 * uViewH;

  float dark = smoothstep(mix(uRamp.x, uRamp.y, 0.4), uRamp.y, py);
  float twinkle = 0.7 + 0.3 * sin(uTime * (0.6 + aStar.w * 2.2) + aStar.w * 40.0);
  vAlpha = dark * twinkle * uOpacity * (0.45 + 0.55 * depth);
  vTone = fract(aStar.w * 13.7);

  gl_Position = vec4(aStar.x, y, 0.998, 1.0);
  gl_PointSize = aStar.z * (0.6 + 0.6 * depth) * uPixelRatio;
}
