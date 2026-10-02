// Obsidiana pulida: cuerpo casi negro índigo, especular nítido, reflejo tenue del papel en el
// borde y rim índigo en el lado opuesto a la luz. Los colores son sRGB directos (sin conversión).
uniform sampler2D uMap;
uniform mat3 normalMatrix;
uniform vec3 uLightDir;
uniform vec3 uRimDir;
// Peso del reflejo del papel: 1 sobre la página clara, 0 dentro del panel oscuro.
uniform float uEnv;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;

const vec3 DEEP = vec3(0.027, 0.024, 0.090);   // #07061A
const vec3 VEIN = vec3(0.110, 0.114, 0.300);   // índigo noche aclarado
const vec3 ACCENT = vec3(0.357, 0.357, 0.941); // #5B5BF0
const vec3 PAPER = vec3(0.910, 0.910, 0.980);  // #E8E8FA

void main() {
  vec4 tex = texture2D(uMap, vUv);
  vec3 n = normalize(normalMatrix * (tex.xyz * 2.0 - 1.0));
  vec3 ns = normalize(vNormal);
  vec3 v = normalize(-vViewPos);
  vec3 l = uLightDir;

  float facing = max(dot(ns, v), 0.0);
  float lit = max((dot(ns, l) + 0.3) / 1.3, 0.0);

  vec3 color = mix(DEEP, VEIN, tex.a * 0.3) * (0.6 + 0.9 * lit);

  // El brillo nítido usa una normal casi lisa: la obsidiana refleja limpio y el relieve solo lo ondula.
  vec3 h = normalize(l + v);
  vec3 ng = normalize(mix(ns, n, 0.3));
  float spec = pow(max(dot(ng, h), 0.0), 140.0) * 0.9 + pow(max(dot(ns, h), 0.0), 16.0) * 0.07;
  color += vec3(0.93, 0.93, 1.0) * spec;

  vec3 r = reflect(-v, n);
  float env = smoothstep(-0.1, 0.9, r.y) * smoothstep(-0.4, 0.6, dot(ns, l));
  float fres = pow(1.0 - facing, 4.0);
  color = mix(color, PAPER, fres * env * 0.32 * uEnv);

  float rim = pow(1.0 - facing, 2.4) * smoothstep(-0.15, 0.7, dot(ns, uRimDir));
  color += ACCENT * rim * 1.15;

  gl_FragColor = vec4(color, 1.0);
}
