#include <fog_pars_fragment>
precision highp float;

uniform float uOpacity;
uniform vec3 uTroughColor;
uniform vec3 uSurfaceColor;
uniform vec3 uPeakColor;
uniform float uPeakThreshold;
uniform float uPeakTransition;
uniform float uTroughThreshold;
uniform float uTroughTransition;
uniform float uFresnelScale;
uniform float uFresnelPower;
uniform float uGlowIntensity;

varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform samplerCube uEnvironmentMap;

void main() {
  vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
  vec3 reflectedDirection = reflect(viewDirection, vNormal);
  reflectedDirection.x = -reflectedDirection.x;
  vec4 reflectionColor = textureCube(uEnvironmentMap, reflectedDirection);

  float fresnel = uFresnelScale * pow(1.0 - clamp(dot(viewDirection, vNormal), 0.0, 1.0), uFresnelPower);

  float elevation = vWorldPosition.y;
  float peakFactor = smoothstep(uPeakThreshold - uPeakTransition, uPeakThreshold + uPeakTransition, elevation);
  float troughFactor = smoothstep(uTroughThreshold - uTroughTransition, uTroughThreshold + uTroughTransition, elevation);

  vec3 mixedColor1 = mix(uTroughColor, uSurfaceColor, troughFactor);
  vec3 mixedColor2 = mix(mixedColor1, uPeakColor, peakFactor);
  vec3 finalColor = mix(mixedColor2, reflectionColor.rgb, fresnel);

  float lightBoost = smoothstep(
    uPeakThreshold + uPeakTransition * 0.5,
    uPeakThreshold + uPeakTransition * 1.5,
    elevation
  );
  lightBoost *= lightBoost;
  finalColor += lightBoost * uPeakColor * uGlowIntensity;

  gl_FragColor = vec4(finalColor, uOpacity);
  #include <fog_fragment>
}
