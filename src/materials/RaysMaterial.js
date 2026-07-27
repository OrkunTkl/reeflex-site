import { extend } from '@react-three/fiber'
import * as THREE from 'three'
import vertexShader from '../shaders/rays/rays.vert'
import fragmentShader from '../shaders/rays/rays.frag'

export class RaysMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                glowColor: { value: new THREE.Color('#fcfcdd') },
                opacity: { value: 0.2 },
                maskMap: { value: null },
                uRepeat: { value: new THREE.Vector2(3, 1) },
                uOffset: { value: 0.0 },
                uSpeed: { value: 1.0 },
                uAmplitude: { value: 0.05 },
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
        })
    }
}

extend({ RaysMaterial })
