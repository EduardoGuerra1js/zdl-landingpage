// Hornea el mapa del planeta (equirectangular, mismo UV que SphereGeometry de Three.js).
// RGB: normal en espacio de objeto con el relieve aplicado. A: máscara de vetas.
// El ruido se evalúa sobre la dirección 3D, así que no hay costura en el meridiano.
// Se concatena detrás de noise.glsl.

varying vec2 vUv;

const float PI = 3.141592653589793;
const float BUMP = 0.025;
const float EPS = 0.0015;

vec3 dirFromUv(vec2 uv) {
  float phi = uv.x * 2.0 * PI;
  float theta = (1.0 - uv.y) * PI;
  return vec3(-cos(phi) * sin(theta), cos(theta), sin(phi) * sin(theta));
}

float veins(vec3 d) {
  vec3 warp = vec3(snoise(d * 1.7 + 3.1), snoise(d * 1.7 + 7.7), snoise(d * 1.7 + 11.3)) * 0.35;
  float ridge = 1.0 - abs(snoise(d * 2.6 + warp));
  return pow(ridge, 14.0);
}

float height(vec3 d) {
  return 0.6 * fbm(d * 1.4) + 0.06 * veins(d) + 0.008 * snoise(d * 22.0);
}

void main() {
  vec3 d = dirFromUv(vUv);
  vec3 up = abs(d.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t = normalize(cross(up, d));
  vec3 b = cross(d, t);

  float h0 = height(d);
  float ht = (height(normalize(d + t * EPS)) - h0) / EPS;
  float hb = (height(normalize(d + b * EPS)) - h0) / EPS;
  vec3 n = normalize(d - BUMP * (ht * t + hb * b));

  gl_FragColor = vec4(n * 0.5 + 0.5, veins(d));
}
