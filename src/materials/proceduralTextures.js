import * as THREE from 'three'

export function createSandTexture() {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#d8cf9e'
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 4000; i++) {
        const x = Math.random() * size
        const y = Math.random() * size
        const shade = 190 + Math.random() * 55
        ctx.fillStyle = `rgba(${shade},${shade - 10},${shade - 50},${0.15 + Math.random() * 0.2})`
        ctx.fillRect(x, y, 1.4, 1.4)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
}

// Weathered ancient stone/marble — replaces the flat white "moduleTexture"
// ribbed-plastic look used on the reef structures. Mottled limestone base,
// hairline crack fractures, and soft algae-stain blooms baked right into
// the texture so even bare stone reads as old and underwater, not new and
// machined.
export function createStoneTexture() {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#a8a08e'
    ctx.fillRect(0, 0, size, size)

    // mottled shading — weathered mineral variation, not a flat plastic tone
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * size
        const y = Math.random() * size
        const shade = 110 + Math.random() * 95
        ctx.fillStyle = `rgba(${shade},${shade - 6},${shade - 24},${0.08 + Math.random() * 0.18})`
        ctx.fillRect(x, y, 1.6, 1.6)
    }

    // hairline crack fractures
    ctx.strokeStyle = 'rgba(55,50,42,0.32)'
    ctx.lineWidth = 1
    for (let i = 0; i < 16; i++) {
        let x = Math.random() * size
        let y = Math.random() * size
        ctx.beginPath()
        ctx.moveTo(x, y)
        for (let j = 0; j < 5; j++) {
            x += (Math.random() - 0.5) * 40
            y += (Math.random() - 0.5) * 40
            ctx.lineTo(x, y)
        }
        ctx.stroke()
    }

    // soft algae/moss staining blooms, like growth streaking down the stone
    for (let i = 0; i < 12; i++) {
        const x = Math.random() * size
        const y = Math.random() * size
        const r = 18 + Math.random() * 42
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
        grad.addColorStop(0, `rgba(62,84,42,${0.22 + Math.random() * 0.22})`)
        grad.addColorStop(1, 'rgba(62,84,42,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
}

export function createRockTexture() {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#5c6b64'
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * size
        const y = Math.random() * size
        const shade = 60 + Math.random() * 80
        ctx.fillStyle = `rgba(${shade},${shade + 10},${shade},${0.1 + Math.random() * 0.25})`
        ctx.fillRect(x, y, 2, 2)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
}
