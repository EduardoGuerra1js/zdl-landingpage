// Sombra suave "sobre la página": mancha gaussiana índigo noche detrás y debajo del planeta.
uniform float uOpacity;

varying vec2 vLocal;

const vec3 INK = vec3(0.078, 0.086, 0.227); // #14163A

void main() {
  float d2 = dot(vLocal, vLocal);
  float alpha = exp(-d2 * 4.5) * uOpacity;
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(INK, alpha);
}
