// Horizonte de sucesos: disco negro que escribe profundidad, así oculta la mitad trasera del disco.
uniform float uOpacity;

varying vec2 vLocal;

void main() {
  float r = length(vLocal);
  float alpha = 1.0 - smoothstep(RS - 0.006, RS + 0.004, r);
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(0.0, 0.0, 0.0, alpha * uOpacity);
}
