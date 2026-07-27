import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { corridorY, corridorZ, mulberry32 } from '../utils/corridor.js'

function dotTexture() {
    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, 'rgba(255,255,255,0.9)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
}

export default function Phyto({ count = 2200, floatAmplitude = 0.05, floatSpeed = 0.2 }) {
    const phyto = useRef()
    const time = useRef(0)
    const phytoTexture = useMemo(() => dotTexture(), [])

    const { positions, phases } = useMemo(() => {
        const rand = mulberry32(9001)
        const positions = new Float32Array(count * 3)
        const phases = new Float32Array(count)
        for (let i = 0; i < count; i++) {
            const x = 4 - rand() * 86
            const y = corridorY(x) + rand() * 7 - 1
            const z = corridorZ(x) + (rand() - 0.5) * 14
            const i3 = i * 3
            positions[i3 + 0] = x
            positions[i3 + 1] = y
            positions[i3 + 2] = z
            phases[i] = rand() * Math.PI * 2
        }
        return { positions, phases }
    }, [count])

    useFrame((_, delta) => {
        if (!phyto.current) return
        time.current += delta
        const pos = phyto.current.geometry.attributes.position.array
        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            pos[i3 + 1] += Math.sin(time.current * floatSpeed + phases[i]) * floatAmplitude * delta
        }
        phyto.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={phyto}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                map={phytoTexture}
                size={0.1}
                color="white"
                sizeAttenuation
                transparent
                opacity={0.5}
                depthWrite={false}
            />
        </points>
    )
}
