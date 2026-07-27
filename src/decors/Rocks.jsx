import { useGLTF, useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import InstancedCausticMesh from '../effect/caustic/InstancedCausticMesh.jsx'
import { corridorY, corridorZ, mulberry32 } from '../utils/corridor.js'

function firstMeshGeometry(scene) {
    let found = null
    scene.traverse((child) => {
        if (!found && child.isMesh) found = child.geometry
    })
    return found
}

// Deterministic rock wall: placed at regular X intervals, alternating sides,
// offset far enough laterally from the corridor centerline (corridorZ) that
// the camera never clips through them. Also dropped well below the
// corridor floor level so nothing looms into the travel path from below.
function generateDummyMatrices() {
    const rand = mulberry32(1337)
    const dummy = new THREE.Object3D()
    const matrices = []
    const startX = 4
    const endX = -82
    const step = 3.2

    for (let x = startX; x > endX; x -= step) {
        const side = Math.floor((startX - x) / step) % 2 === 0 ? 1 : -1
        const nearStartExtra = x > -2 ? 4 : 0 // sharper curve near the start needs more margin
        const lateral = 7 + nearStartExtra + rand() * 6 // always far enough from the path
        const z = corridorZ(x) + side * lateral
        const y = corridorY(x) - 0.3 - rand() * 0.6
        dummy.position.set(x + (rand() - 0.5) * 1.5, y, z)
        dummy.rotation.set(0, rand() * Math.PI * 2, 0)
        const s = 1.0 + rand() * 1.1
        dummy.scale.set(s, s, s)
        dummy.updateMatrix()
        matrices.push(dummy.matrix.clone())
    }
    return matrices
}

// The closing scene (final CTA / endSentence) previously only had rocks on
// alternating sides from the regular corridor pattern, so it read as "open"
// on the left/center instead of feeling like the dive naturally comes to
// an end. This scatters a proper backdrop cluster behind the last camera
// point — spread across left, center AND right, at varied depth/height/
// rotation/scale so it reads as a natural rock formation, not a flat
// stacked wall.
function generateClosingBackdropMatrices() {
    const rand = mulberry32(9001)
    const dummy = new THREE.Object3D()
    const matrices = []
    const centerX = -83 // just behind the final camera/CTA position (~-73/-78)
    const centerZ = corridorZ(centerX)

    for (let i = 0; i < 34; i++) {
        const spread = rand()
        const angle = (rand() - 0.5) * Math.PI * 1.15 // left, center AND right
        const radius = 4 + spread * 13
        const x = centerX - rand() * 9 // varied depth so it isn't a flat wall
        const z = centerZ + Math.sin(angle) * radius
        const y = corridorY(centerX) - 0.4 - rand() * 2.2 + Math.cos(angle) * 0.6
        dummy.position.set(x, y, z)
        dummy.rotation.set((rand() - 0.5) * 0.3, rand() * Math.PI * 2, (rand() - 0.5) * 0.3)
        const s = 1.1 + rand() * 1.8
        dummy.scale.set(s, s, s)
        dummy.updateMatrix()
        matrices.push(dummy.matrix.clone())
    }
    return matrices
}
export default function Rocks() {
    const rock = useGLTF('/models/rock/fels/scene.gltf')
    const rockGeometry = useMemo(() => firstMeshGeometry(rock.scene), [rock])
    const rockTexture = useTexture('/textures/rockTexture.webp')
    const matrices = useMemo(() => generateDummyMatrices(), [])
    const closingMatrices = useMemo(() => generateClosingBackdropMatrices(), [])

    useEffect(() => {
        rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping
        rockTexture.repeat.set(2, 2)
        rockTexture.needsUpdate = true
    }, [rockTexture])

    if (!rockGeometry) return null

    return (
        <>
            <InstancedCausticMesh
                geometry={rockGeometry}
                texture={rockTexture}
                count={matrices.length}
                matrices={matrices}
            />
            <InstancedCausticMesh
                geometry={rockGeometry}
                texture={rockTexture}
                count={closingMatrices.length}
                matrices={closingMatrices}
            />
        </>
    )
}

useGLTF.preload('/models/rock/fels/scene.gltf')
