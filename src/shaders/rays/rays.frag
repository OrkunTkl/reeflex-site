precision highp float;
varying vec2 vUv;
varying float vOpacity;
uniform sampler2D maskMap;
uniform vec3     glowColor;
uniform vec2     uRepeat;
uniform float    uOffset;
uniform float    uAmplitude;
void main() {
  vec2 uvScaled = vUv * uRepeat;
  vec2 cellUV   = vec2(fract(uvScaled.x), fract(uvScaled.y));
  float off = uOffset;
  vec2 uvCenter = cellUV;
  vec2 uvLeft   = vec2(fract(cellUV.x - off), cellUV.y);
  vec2 uvRight  = vec2(fract(cellUV.x + off), cellUV.y);
  float mC = texture2D(maskMap, uvCenter).r;
  float mL = texture2D(maskMap, uvLeft).r;
  float mR = texture2D(maskMap, uvRight).r;
  float m = max(max(mC, mL), mR);
  if (m < 0.01) discard;
  float a = vOpacity * m;
  gl_FragColor = vec4(glowColor, a);
}
