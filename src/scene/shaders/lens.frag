// Lente gravitacional como pase de pantalla: la imagen se empuja hacia fuera del centro, con más
// fuerza cerca del agujero. Se muestrea siempre más cerca del centro, así nunca sale del lienzo.
// El render target ya trae alfa premultiplicado y se copia tal cual al lienzo.
uniform sampler2D tMap;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;
uniform float uAspect;

varying vec2 vUv;

void main() {
  vec2 d = vUv - uCenter;
  d.x *= uAspect;
  float r2 = dot(d, d);
  float r0 = uRadius * uRadius;
  float k = uStrength * r0 / (r2 + r0);
  vec2 src = uCenter + (vUv - uCenter) * (1.0 - k);
  gl_FragColor = texture2D(tMap, src);
}
