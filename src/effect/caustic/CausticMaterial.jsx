import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function CausticMaterial({ texture, color = '#ffffff', onBeforeCompile: externalHook, ...props }) {
    const shaderRef = useRef()
    const offset = useRef(new THREE.Vector2(0, 0))

    useFrame((state, delta) => {
        const shader = shaderRef.current
        if (!shader) return
        shader.uniforms.uTime.value = state.clock.getElapsedTime()
        offset.current.y += delta * 0.4
        shader.uniforms.uOffset.value = offset.current
        if (texture) shader.uniforms.uRepeat.value = texture.repeat
    })

    return (
        <meshStandardMaterial
            map={texture}
            color={color}
            metalness={0}
            roughness={1}
            {...props}
            onBeforeCompile={(shader) => {
                shaderRef.current = shader
                const { uniforms } = shader

                uniforms.uTime = { value: 0.0 }
                uniforms.uCausticColor = { value: new THREE.Color(0xaef6f7) }
                uniforms.uCausticSpeed = { value: 0.8 }
                uniforms.uCausticIntensity = { value: 0.25 }
                uniforms.uCausticScale = { value: 1.3 }
                uniforms.uOffset = { value: offset.current }
                uniforms.uRepeat = { value: texture ? texture.repeat : new THREE.Vector2(1, 1) }

                shader.vertexShader = `
          varying vec3 vWorldPosition;
          ${shader.vertexShader}
        `.replace(
                    '#include <worldpos_vertex>',
                    `#include <worldpos_vertex>
           vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
                )

                shader.fragmentShader = `
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform vec3  uCausticColor;
  uniform float uCausticSpeed;
  uniform float uCausticIntensity;
  uniform float uCausticScale;
  uniform vec2  uOffset;
  uniform vec2  uRepeat;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }
  float voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float F1 = 8.0;
    for (int j = -1; j <= 1; j++)
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(i, j);
        vec2 o = hash(n + g);
        o = 0.5 + 0.41 * sin(uTime + 6.2831 * o);
        vec2 r = g - f + o;
        float d = dot(r, r);
        F1 = min(F1, d);
      }
    return F1;
  }
${shader.fragmentShader}
`

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <fog_fragment>',
                    `
    float noise = voronoi(vWorldPosition.xz * uCausticScale + uOffset);
    float caustic = (noise) * uCausticIntensity;
    gl_FragColor.rgb += caustic * uCausticColor;
    #include <fog_fragment>
  `
                )

                if (externalHook) externalHook(shader)
            }}
        />
    )
}
