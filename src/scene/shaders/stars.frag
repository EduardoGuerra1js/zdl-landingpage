varying float vAlpha;
varying float vTone;

const vec3 COOL = vec3(0.725, 0.725, 0.89);  // --dark-muted #B9B9E3
const vec3 WARM = vec3(0.969, 0.965, 0.988); // --dark-ink #F7F6FC

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float alpha = pow(1.0 - smoothstep(0.0, 1.0, d), 2.0) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(mix(COOL, WARM, vTone), alpha);
}
