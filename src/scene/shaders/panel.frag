// Fondo del panel oscuro de "Sobre" (sustituye al fondo CSS con WebGL activo).
// Rectángulo redondeado por SDF, retícula de 1 px como la del CSS y sombra suave hacia abajo.
// Todo en px CSS con el origen en el centro del panel.
uniform vec2 uQuad;
uniform vec2 uHalf;
uniform float uRadius;
uniform float uCell;

varying vec2 vLocal;

const vec3 SPACE = vec3(0.027, 0.024, 0.102); // #07061A
const vec3 LINE = vec3(0.647, 0.647, 1.0);    // --dark-line: #A5A5FF al 18 %
const vec3 INK = vec3(0.078, 0.086, 0.227);   // #14163A

float roundedBox(vec2 p, vec2 extent, float r) {
  vec2 q = abs(p) - extent + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 p = vLocal * uQuad;
  float d = roundedBox(p, uHalf, uRadius);
  float aa = fwidth(d);
  float inside = 1.0 - smoothstep(-0.5 * aa, 0.5 * aa, d);

  // Igual que background-position: center con celdas de uCell: líneas en -uCell/2 + k·uCell.
  vec2 cell = mod(p + 0.5 * uCell, uCell);
  vec2 lw = fwidth(p);
  float gx = 1.0 - smoothstep(0.0, lw.x, cell.x - 1.0);
  float gy = 1.0 - smoothstep(0.0, lw.y, cell.y - 1.0);
  vec3 color = mix(SPACE, LINE, max(gx, gy) * 0.18);

  // Sombra fuera del panel (equivale a --shadow-2: 18 px hacia abajo, 40 px de difuminado).
  float ds = roundedBox(p - vec2(0.0, -18.0), uHalf - 12.0, uRadius);
  float shadow = 0.18 * exp(-pow(max(ds, 0.0) / 22.0, 2.0)) * (1.0 - inside);

  float alpha = inside + shadow;
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(mix(INK, color, inside), alpha);
}
