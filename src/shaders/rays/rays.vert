varying vec2 vUv;
varying float vOpacity;
uniform float opacity;
void main() {
  vUv       = uv;
  vOpacity  = opacity;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
