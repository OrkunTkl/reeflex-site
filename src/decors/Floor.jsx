import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import CausticMesh from '../effect/caustic/CausticMesh.jsx'
import { corridorY, corridorZ } from '../utils/corridor.js'

// Real Floor.jsx loads a pre-modeled sol.glb that already spans the whole
// corridor in world space. We don't have that binary, so we bake the same
// coverage into a procedural plane, following the REAL module Y positions
// (via corridorY/corridorZ) so structures sit ON the sand instead of
// floating above it.
function sandGeometry() {
    const geo = new THREE.PlaneGeometry(200, 55, 160, 44)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const localZ = pos.getZ(i)
        const worldZ = localZ + corridorZ(x)
        const ripple = Math.sin(x * 0.3) * 0.05 + Math.cos(worldZ * 0.4 + x * 0.1) * 0.05
        pos.setZ(i, worldZ)
        pos.setY(i, corridorY(x) - 0.15 + ripple)
    }
    geo.computeVertexNormals()
    return geo
}

export default function Floor() {
    const solTexture = useTexture('/textures/solTexture.webp')
    const geometry = useMemo(() => sandGeometry(), [])

    useEffect(() => {
        solTexture.wrapS = solTexture.wrapT = THREE.RepeatWrapping
        solTexture.repeat.set(60, 10)
        solTexture.needsUpdate = true
    }, [solTexture])

    return (
        <CausticMesh
            geometry={geometry}
            texture={solTexture}
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
            rotation={[0, 0, 0]}
        />
    )
}
