varying float vAlpha;
varying float vTone;

const vec3 INK = vec3(0.078, 0.086, 0.227);    // #14163A
const vec3 ACCENT = vec3(0.247, 0.247, 0.788); // #3F3FC9

void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = (1.0 - smoothstep(0.15, 0.5, d)) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(mix(INK, ACCENT, vTone), alpha);
}
