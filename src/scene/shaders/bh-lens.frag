// Lente gravitacional barata, en un solo quad de cara a la cámara (vLocal de -1.3 a 1.3):
// arco de luz sobre el horizonte (imagen lensada del disco trasero), anillo de fotones y halo.
uniform float uTime;
uniform float uOpacity;

varying vec2 vLocal;

void main() {
  float rho = length(vLocal);
  float a = atan(vLocal.y, vLocal.x);
  float up = 0.5 + 0.5 * sin(a);  // 1 arriba, 0 abajo

  float arcT = clamp((rho - (RS + 0.04)) / 0.42, 0.0, 1.0);
  float arcMask = smoothstep(RS + 0.015, RS + 0.05, rho) * (1.0 - smoothstep(RS + 0.2, RS + 0.46, rho));
  float arcWeight = mix(0.25, 1.0, smoothstep(0.0, 1.0, up));
  float phi = a - uTime * omega(mix(R_IN, R_OUT, arcT));
  float streak = 0.6 + 0.4 * sin(4.0 * phi + 12.0 * rho);
  float beam = 1.0 - 0.5 * cos(a);
  vec3 arcColor = heat(arcT * 0.8) * (0.5 + pow(1.0 - arcT, 1.4)) * beam;
  float arc = arcMask * arcWeight * streak * 0.55;

  float ring = exp(-pow((rho - (RS + 0.022)) / 0.011, 2.0));
  vec3 ringColor = vec3(1.0, 0.95, 0.85) * (0.8 + 0.4 * beam);

  float halo = exp(-(rho - RS) * 4.2) * smoothstep(RS, RS + 0.05, rho) * 0.3;
  vec3 haloColor = vec3(0.5, 0.38, 0.98);

  vec3 color = arcColor * arc + ringColor * ring * 0.9 + haloColor * halo;
  // Aditivo: el alfa sigue a la luz para no dejar un cuadro opaco en el lienzo.
  float light = max(color.r, max(color.g, color.b));
  if (light < 0.004) discard;
  gl_FragColor = vec4(color / light, min(1.0, light) * uOpacity);
}
