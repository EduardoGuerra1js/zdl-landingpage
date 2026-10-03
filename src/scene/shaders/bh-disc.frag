// Cuerpo continuo del disco (plano inclinado por el padre): estrías que giran con la rotación
// diferencial, para que las partículas no se vean como puntos sueltos. vLocal va de -1 a 1.
uniform float uTime;
uniform float uOpacity;

varying vec2 vLocal;

void main() {
  float r = length(vLocal);
  float a = atan(vLocal.y, vLocal.x);
  float t = clamp((r - R_IN) / (R_OUT - R_IN), 0.0, 1.0);

  float body = smoothstep(R_IN - 0.015, R_IN + 0.03, r) * pow(1.0 - smoothstep(0.3, 1.0, t), 1.5);
  if (body < 0.002) discard;

  // Un patrón fijo al disco, deformado por omega(r): las estrías se enroscan hacia dentro.
  float phi = a - uTime * omega(r);
  float streak = 0.55 + 0.25 * sin(3.0 * phi + 9.0 * r) + 0.2 * sin(7.0 * phi - 15.0 * r + 1.3);
  float beam = 1.0 - 0.55 * cos(a);
  float glow = pow(1.0 - t, 1.5);

  vec3 color = heat(t) * (0.4 + 1.1 * glow) * beam;
  gl_FragColor = vec4(color, body * streak * 0.55 * uOpacity);
}
