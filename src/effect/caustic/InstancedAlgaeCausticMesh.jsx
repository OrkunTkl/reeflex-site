import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import CausticMaterial from './CausticMaterial.jsx'

export default function InstancedAlgaeCausticMesh({ geometry, texture, count, matrices }) {
    const meshRef = useRef()

    useEffect(() => {
        const mesh = meshRef.current
        if (!mesh || !matrices.length) return
        matrices.forEach((mat, i) => mesh.setMatrixAt(i, mat))
        mesh.instanceMatrix.needsUpdate = true
        mesh.frustumCulled = false
    }, [matrices])

    if (!count) return null

    return (
        <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
            <CausticMaterial
                texture={texture}
                transparent
                alphaTest={0.3}
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    )
}
