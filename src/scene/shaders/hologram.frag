// Holograma AR sobre el planeta (solo dentro del panel oscuro, blending ADITIVO).
// Malla de meridianos y paralelos + curvas de nivel procedurales.
// Una línea de escaneo baja por la esfera según uScan y deja la malla revelada a su paso.
uniform float uScan;
uniform float uPanel;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;

const vec3 HOLO = vec3(0.647, 0.647, 1.0); // --dark-accent #A5A5FF

float gridLine(float coord, float count) {
  float f = coord * count;
  float w = fwidth(f);
  float d = abs(fract(f - 0.5) - 0.5);
  return 1.0 - smoothstep(0.5 * w, 1.5 * w, d);
}

float veins(vec2 uv) {
  float a = sin(uv.x * 48.0 + sin(uv.y * 19.0) * 3.2);
  float b = sin((uv.x + uv.y) * 31.0 - sin(uv.x * 11.0) * 2.0);
  return 0.5 + 0.5 * (a * 0.72 + b * 0.28);
}

void main() {
  if (uPanel < 0.01 || uScan < 0.001) discard;

  vec3 n = normalize(vNormal);
  vec3 v = normalize(-vViewPos);
  float facing = max(dot(n, v), 0.0);

  float mesh = max(gridLine(vUv.x, 24.0), gridLine(vUv.y, 12.0));
  float contour = gridLine(veins(vUv), 5.0) * 0.6;

  // La línea va de arriba (n.y = 1.1) a abajo (-1.1) en espacio de vista.
  float scanY = mix(1.1, -1.1, uScan);
  float revealed = smoothstep(scanY - 0.02, scanY + 0.06, n.y);
  float band = exp(-pow((n.y - scanY) / 0.035, 2.0)) * step(uScan, 0.999);
  // Mientras pasa la línea la malla brilla; al terminar queda tenue, como "escaneada".
  float settle = mix(0.2, 0.8, 1.0 - uScan);

  float edge = 0.35 + 0.65 * pow(1.0 - facing, 1.5);
  float intensity = (max(mesh, contour) * revealed * settle * edge + band * (0.55 + 0.45 * mesh)) * uPanel;
  if (intensity < 0.004) discard;
  gl_FragColor = vec4(HOLO * intensity, 1.0);
}
