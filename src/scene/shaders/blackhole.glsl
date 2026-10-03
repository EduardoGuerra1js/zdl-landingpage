// Piezas comunes del agujero negro. Unidades: radio exterior del disco = 1.
// Colores en sRGB directo (los ShaderMaterial no convierten espacio de color).
const float RS = 0.30;     // horizonte de sucesos
const float R_IN = 0.36;   // borde interno del disco
const float R_OUT = 1.0;   // borde externo del disco

// Temperatura del disco: 0 = interior caliente, 1 = borde violeta.
vec3 heat(float t) {
  vec3 c0 = vec3(1.0, 0.93, 0.80);   // blanco cálido
  vec3 c1 = vec3(1.0, 0.56, 0.30);   // naranja
  vec3 c2 = vec3(0.74, 0.30, 0.86);  // magenta violeta
  vec3 c3 = vec3(0.36, 0.36, 0.94);  // #5B5BF0, índigo de marca
  vec3 c = mix(c0, c1, smoothstep(0.0, 0.22, t));
  c = mix(c, c2, smoothstep(0.18, 0.55, t));
  return mix(c, c3, smoothstep(0.5, 1.0, t));
}

// Rotación diferencial (kepleriana): rad/s. Lo de dentro gira bastante más rápido.
float omega(float r) {
  return 0.5 * pow(R_IN / r, 1.5);
}
