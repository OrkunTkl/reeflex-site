import * as THREE from 'three'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import vertexShader from '../shaders/water/water.vert'
import fragmentShader from '../shaders/water/water.frag'
import WaveController from '../WaveControler'
import { useWaveStore } from '../utils/store/waveStore'

class WaterShaderMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            vertexShader,
            fragmentShader,
            transparent: true,
            depthTest: true,
            fog: true,
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib.fog,
                {
                    uTime: { value: 0 },
                    uOpacity: { value: 0.90 },
                    uWavesAmplitude: { value: 0.02 },
                    uWavesFrequency: { value: 3.06 },
                    uWavesPersistence: { value: 0.08 },
                    uWavesLacunarity: { value: 3.08 },
                    uWavesIterations: { value: 0.08 },
                    uWavesSpeed: { value: 0.84 },
                    uTroughColor: { value: new THREE.Color('#4590b4') },
                    uSurfaceColor: { value: new THREE.Color('#4590b4') },
                    uPeakColor: { value: new THREE.Color('#1efffa') },
                    uPeakThreshold: { value: 0. },
                    uPeakTransition: { value: 0.05 },
                    uTroughThreshold: { value: -0.01 },
                    uTroughTransition: { value: 0.15 },
                    uFresnelScale: { value: 0.5 },
                    uFresnelPower: { value: 0.5 },
                    uEnvironmentMap: { value: null },
                    uGlowIntensity: { value: 0.5 },
                    uBigWavesAmplitude: { value: 0.64 },
                    uBigWavesFrequency: { value: 0.1 },
                    uBigWavesSpeed: { value: 0.2 },
                }
            ])
        })
    }
}
extend({ WaterShaderMaterial })

export default function Water(props) {
    const active = useWaveStore((state) => state.active)
    const materialRef = useRef()
    const { scene } = useThree()
    useEffect(() => {
        if (materialRef.current && scene.environment) {
            materialRef.current.uniforms.uEnvironmentMap.value = scene.environment
        }
    }, [scene.environment])
    useFrame((_, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta
        }
    })

    return (
        <>
            <WaveController materialRef={materialRef} active={active} duration={1} />
            <mesh {...props}>
                <planeGeometry args={[60, 30, 200, 110]} />
                <waterShaderMaterial ref={materialRef} />
            </mesh>
        </>
    )
}
