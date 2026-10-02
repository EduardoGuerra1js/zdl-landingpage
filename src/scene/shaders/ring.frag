// Dos modos sobre la misma geometría de anillo:
// uLine = 0 → banda translúcida con bordes suaves y estrías finas.
// uLine = 1 → línea de ~1.5 px de pantalla en el radio uInner (antialias con fwidth).
uniform float uInner;
uniform float uOuter;
uniform float uOpacity;
uniform float uLine;
uniform vec3 uColor;

varying vec2 vLocal;

void main() {
  float r = length(vLocal);
  float alpha;
  if (uLine > 0.5) {
    float w = fwidth(r);
    alpha = 1.0 - smoothstep(0.5 * w, 1.6 * w, abs(r - uInner));
  } else {
    float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
    float edge = smoothstep(0.0, 0.18, t) * (1.0 - smoothstep(0.82, 1.0, t));
    float bands = 0.72 + 0.28 * sin(t * 41.0) * sin(t * 13.0 + 1.3);
    alpha = edge * bands;
  }
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(uColor, alpha * uOpacity);
}
