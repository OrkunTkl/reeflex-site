import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

function makeFaceCanvas(topColor, bottomColor) {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 0, size)
    grad.addColorStop(0, topColor)
    grad.addColorStop(1, bottomColor)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    return canvas
}

export default function EnvMap() {
    const { scene } = useThree()

    const cubeTexture = useMemo(() => {
        const sky = '#bdf0ff'
        const horizon = '#2a95b8'
        const deep = '#062430'
        const faces = [
            makeFaceCanvas(horizon, deep), // +x
            makeFaceCanvas(horizon, deep), // -x
            makeFaceCanvas(sky, horizon), // +y (up)
            makeFaceCanvas(deep, deep), // -y (down)
            makeFaceCanvas(horizon, deep), // +z
            makeFaceCanvas(horizon, deep), // -z
        ]
        const tex = new THREE.CubeTexture(faces)
        tex.needsUpdate = true
        return tex
    }, [])

    useEffect(() => {
        scene.environment = cubeTexture
        return () => {
            if (scene.environment === cubeTexture) scene.environment = null
        }
    }, [scene, cubeTexture])

    return null
}
