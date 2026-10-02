// Polvo orbital animado por completo en la GPU: los atributos son estáticos y solo cambia uTime.
// aOrbit = (radio, fase, altura, velocidad); aLook = (tamaño px, tono 0..1).
attribute vec4 aOrbit;
attribute vec2 aLook;

uniform float uTime;
uniform float uPixelRatio;
uniform float uOpacity;

varying float vAlpha;
varying float vTone;

void main() {
  float r = aOrbit.x;
  float angle = aOrbit.y + uTime * aOrbit.w / r;
  vec3 p = vec3(cos(angle) * r, aOrbit.z, sin(angle) * r);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aLook.x * uPixelRatio;

  float twinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aOrbit.w * 4.0) + aOrbit.y * 7.0);
  vAlpha = uOpacity * twinkle;
  vTone = aLook.y;
}
