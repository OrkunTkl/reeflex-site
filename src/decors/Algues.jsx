import { useMemo } from 'react'
import * as THREE from 'three'
import { corridorY, corridorZ, mulberry32 } from '../utils/corridor.js'
import InstancedAlgaeCausticMesh from '../effect/caustic/InstancedAlgaeCausticMesh.jsx'

function bladeGeometry(height) {
    const geo = new THREE.PlaneGeometry(0.09, height, 1, 5)
    geo.translate(0, height / 2, 0)
    return geo
}

function grassTexture() {
    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, size, 0, 0)
    grad.addColorStop(0, '#1f4d2a')
    grad.addColorStop(1, '#8fce4a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
}

// Deterministic seagrass clumps, biased to the sides of the corridor (never
// dead-center where the camera travels) so sightlines to the modules stay
// clear.
function generateMatrices() {
    const rand = mulberry32(4242)
    const dummy = new THREE.Object3D()
    const up = new THREE.Vector3(0, 1, 0)
    const mats = [[], [], []]
    const clumpCount = 46

    for (let c = 0; c < clumpCount; c++) {
        const x = 3 - c * 1.8 + (rand() - 0.5) * 0.6
        const side = c % 2 === 0 ? 1 : -1
        const lateral = 2.2 + rand() * 3.5
        const clumpZ = corridorZ(x) + side * lateral
        const clumpY = corridorY(x) - 0.05
        const bladesInClump = 10 + Math.floor(rand() * 10)
        for (let b = 0; b < bladesInClump; b++) {
            const type = Math.floor(rand() * 3)
            dummy.position.set(
                clumpX(x, rand),
                clumpY,
                clumpZ + (rand() - 0.5) * 1.2
            )
            dummy.quaternion.setFromAxisAngle(up, rand() * Math.PI * 2)
            const scale = 0.5 + rand() * 0.9
            dummy.scale.set(scale, scale, scale)
            dummy.updateMatrix()
            mats[type].push(dummy.matrix.clone())
        }
    }
    return mats
}

function clumpX(x, rand) {
    return x + (rand() - 0.5) * 1.2
}

export default function Algues() {
    const texture = useMemo(() => grassTexture(), [])
    const geometries = useMemo(() => [bladeGeometry(0.7), bladeGeometry(1.1), bladeGeometry(1.5)], [])
    const matricesByType = useMemo(() => generateMatrices(), [])

    return (
        <>
            {geometries.map((geo, i) => (
                <InstancedAlgaeCausticMesh
                    key={i}
                    geometry={geo}
                    texture={texture}
                    count={matricesByType[i].length}
                    matrices={matricesByType[i]}
                />
            ))}
        </>
    )
}
