import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import '../materials/RaysMaterial.js'
import { createRaysMaskTexture } from '../materials/raysMaskTexture.js'

export default function Rays(props) {
    const meshRef = useRef()
    const materialRef = useRef()
    const maskMap = useMemo(() => createRaysMaskTexture(), [])

    useEffect(() => {
        if (!maskMap || !materialRef.current) return
        const uni = materialRef.current.uniforms
        uni.maskMap.value = maskMap
        uni.maskMap.needsUpdate = true
        uni.uRepeat.value.set(20, 1)
        maskMap.minFilter = THREE.LinearFilter
    }, [maskMap])

    useFrame(({ clock }) => {
        if (materialRef.current) {
            const speed = materialRef.current.uniforms.uSpeed.value
            const amp = materialRef.current.uniforms.uAmplitude.value
            const t = clock.getElapsedTime()
            materialRef.current.uniforms.uOffset.value = (t * speed * amp) % 1.0
        }
    })

    return (
        <mesh ref={meshRef} renderOrder={999} {...props}>
            <planeGeometry args={[60, 50]} />
            <raysMaterial ref={materialRef} />
        </mesh>
    )
}
