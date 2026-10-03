// Velo del cierre: de papel claro a #07061A según la posición vertical en pantalla. La rampa
// vive en la página (no en el tiempo), así que el scroll la mueve y no hay nada que sincronizar.
uniform vec2 uRamp;   // y0, y1 en px desde el borde superior del lienzo
uniform float uViewH;
uniform vec3 uColor;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float y = (1.0 - vUv.y) * uViewH;
  float alpha = smoothstep(uRamp.x, uRamp.y, y);
  if (alpha <= 0.0) discard;
  // Un poco de ruido en el alfa evita bandas en el degradado largo.
  alpha += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(uColor, min(alpha, 1.0));
}
