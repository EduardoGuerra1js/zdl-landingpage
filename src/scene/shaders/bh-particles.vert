// Disco de acreción animado por completo en la GPU: los atributos son estáticos y solo cambia uTime.
// aDisk = (radio, fase, grosor, semilla). Con uLens = 1 se dibuja la imagen "lensada" del disco:
// la luz del lado trasero se curva sobre el horizonte y forma un arco por encima (y uno tenue debajo).
attribute vec4 aDisk;

uniform float uTime;
uniform float uPixelRatio;
uniform float uOpacity;
uniform float uTilt;     // inclinación respecto a verse de frente (rad)
uniform float uLens;
uniform float uScalePx;  // radio del disco en px de pantalla

varying vec3 vColor;
varying float vAlpha;

void main() {
  float r = aDisk.x;
  float seed = aDisk.w;
  float a = aDisk.y + uTime * omega(r);
  float c = cos(a);
  float s = sin(a);
  float t = clamp((r - R_IN) / (R_OUT - R_IN), 0.0, 1.0);

  vec3 p;
  float weight = 1.0;
  if (uLens < 0.5) {
    float cT = cos(uTilt);
    float sT = sin(uTilt);
    float lift = aDisk.z;
    // s > 0 es el lado trasero (arriba y lejos de la cámara); s < 0, el delantero.
    p = vec3(r * c, r * s * cT + lift * sT, -r * s * sT + lift * cT);
  } else {
    float rl = mix(RS + 0.04, RS + 0.42, pow(t, 0.8));
    weight = s > 0.0 ? 1.0 : 0.3;
    p = vec3(rl * c, rl * s * (s > 0.0 ? 1.0 : 0.8), 0.02);
  }

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float glow = pow(1.0 - t, 1.3);
  float beam = 1.0 - 0.55 * c;  // el lado que se acerca (izquierda) brilla más
  vColor = heat(t) * (0.55 + 0.9 * glow) * beam;

  float flicker = 0.78 + 0.22 * sin(uTime * (2.0 + seed * 6.0) + seed * 60.0);
  vAlpha = uOpacity * flicker * weight * (uLens > 0.5 ? 0.55 : 1.0);

  float size = 1.1 + 2.6 * seed * seed + 2.2 * glow * seed;
  gl_PointSize = size * clamp(uScalePx / 260.0, 0.45, 1.6) * uPixelRatio;
}
