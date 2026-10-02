// Luna de piedra mate: difuso envolvente sin especular, para contrastar con la obsidiana.
uniform vec3 uLightDir;
uniform vec3 uRimDir;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;

const vec3 DARK = vec3(0.150, 0.150, 0.300);
const vec3 LIGHT = vec3(0.700, 0.695, 0.820);
const vec3 ACCENT = vec3(0.357, 0.357, 0.941);

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(-vViewPos);
  float lit = smoothstep(-0.25, 1.0, dot(n, uLightDir));
  vec3 color = mix(DARK, LIGHT, lit);
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.0) * smoothstep(0.0, 0.8, dot(n, uRimDir));
  color += ACCENT * rim * 0.6;
  gl_FragColor = vec4(color, 1.0);
}
