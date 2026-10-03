// Cuadro a pantalla completa pegado al fondo del buffer de profundidad (z = 0.999): lo que se
// dibuja delante, como el cuerpo opaco del planeta, lo tapa.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.999, 1.0);
}
