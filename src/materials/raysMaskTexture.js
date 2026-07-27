import * as THREE from 'three'

export function createRaysMaskTexture() {
    const width = 256
    const height = 256
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    const streakCount = 7
    for (let i = 0; i < streakCount; i++) {
        const x = (i / streakCount) * width + (Math.random() - 0.5) * 12;
        const w = 6 + Math.random() * 18
        const grad = ctx.createLinearGradient(x - w, 0, x + w, 0)
        grad.addColorStop(0, 'rgba(255,255,255,0)')
        grad.addColorStop(0.5, `rgba(255,255,255,${0.5 + Math.random() * 0.4})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grad
        ctx.fillRect(x - w, 0, w * 2, height)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
}
