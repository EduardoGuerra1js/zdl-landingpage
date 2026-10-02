// Halo de atmósfera sobre las caras traseras de una esfera mayor. Blending NORMAL: sobre papel
// claro un halo aditivo desaparecería. El alfa cae del borde del planeta (uInner) al exterior.
uniform float uInner;
uniform float uOpacity;
uniform vec3 uRimDir;

varying vec3 vNormal;
varying vec3 vViewPos;

const vec3 ACCENT = vec3(0.357, 0.357, 0.941);

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(-vViewPos);
  float d = dot(n, v);
  float rho = sqrt(max(1.0 - d * d, 0.0));
  float t = clamp((rho - uInner) / (1.0 - uInner), 0.0, 1.0);
  float falloff = pow(1.0 - t, 2.4);

  vec2 side = n.xy / max(length(n.xy), 1e-4);
  float bias = 0.5 + 0.5 * smoothstep(-0.7, 0.9, dot(side, normalize(uRimDir.xy)));

  gl_FragColor = vec4(ACCENT, falloff * bias * uOpacity);
}
