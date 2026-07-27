import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { mulberry32, corridorZ, corridorY } from '../utils/corridor.js'

// tuna_v2 and "school" are each genuinely a SINGLE fish model — so they now
// swim solo, one lone individual at a time, instead of being cloned into a
// fake crowd. herring and tropical are real pre-baked GROUP models (several
// fish + their own baked swim animation already inside one glb) — those get
// used as-is, a single instance per placement, never cloned into a bigger
// pile.
const MODELS = {
    tuna: '/models/fish/tuna_v2/scene.glb',
    loner: '/models/fish/school/scene.glb',
    herring: '/models/fish/herring/scene.glb',
    tropical: '/models/fish/tropical/scene.glb',
}

// Properly clone a (possibly skinned/animated) GLTF scene. Object3D.clone()
// does NOT correctly rebind skeletons for skinned meshes — SkeletonUtils is
// required or animated models render mangled/frozen once more than one
// instance shares the same source scene.
function useClonedScene(url) {
    const gltf = useGLTF(url)
    const clone = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene])
    return { clone, animations: gltf.animations }
}

// A single, lone fish wandering its own little patch of water — used for
// every model that is genuinely just one fish (tuna_v2, "school"). Plays
// its own built-in swim animation.
function SoloFish({ model, center, scale = 0.3, seed = 1 }) {
    const rand = useMemo(() => mulberry32(seed), [seed])
    const phase = useMemo(() => rand() * Math.PI * 2, [rand])
    const radius = useMemo(() => 0.6 + rand() * 0.4, [rand])
    const { clone, animations } = useClonedScene(model)
    const group = useRef()
    const { actions, names } = useAnimations(animations, group)

    useEffect(() => {
        if (names.length) actions[names[0]].reset().play()
    }, [actions, names])

    const ref = useRef()
    const prev = useRef(new THREE.Vector3(1000, 1000, 1000))

    useFrame((state) => {
        const t = state.clock.elapsedTime * 0.35 + phase
        const x = center[0] + Math.cos(t) * radius
        const y = center[1] + Math.sin(t * 1.3) * 0.2
        const z = center[2] + Math.sin(t) * radius * 0.6
        if (ref.current) {
            const dx = x - prev.current.x
            const dz = z - prev.current.z
            if (Math.abs(dx) > 1e-5 || Math.abs(dz) > 1e-5) {
                ref.current.rotation.y = Math.atan2(dx, dz)
            }
            ref.current.position.set(x, y, z)
            prev.current.set(x, y, z)
        }
    })

    return (
        <group ref={ref}>
            <primitive ref={group} object={clone} scale={scale} />
        </group>
    )
}

// A real, pre-built group of fish (herring/tropical) — the whole thing
// circles a point in open water or around a nearby structure. The model's
// own baked animation already makes the individual fish inside it swim, so
// this just needs to carry the whole group around as ONE instance —
// exactly like the real asset was authored, never cloned into duplicates.
function SchoolCruise({ model, center, radius = 5, height = 1.4, speed = 0.12, scale = 1, seed = 1 }) {
    const { clone, animations } = useClonedScene(model)
    const group = useRef()
    const { actions, names } = useAnimations(animations, group)
    const phase = useMemo(() => mulberry32(seed)() * Math.PI * 2, [seed])

    useEffect(() => {
        if (names.length) actions[names[0]].reset().play()
    }, [actions, names])

    const ref = useRef()
    useFrame((state) => {
        if (!ref.current) return
        const t = state.clock.elapsedTime * speed + phase
        const x = center[0] + Math.cos(t) * radius
        const z = center[2] + Math.sin(t) * radius
        const y = center[1] + height + Math.sin(t * 2.3) * 0.25
        ref.current.position.set(x, y, z)
        // face the direction of travel around the circle
        ref.current.rotation.y = -t - Math.PI / 2
    })

    return (
        <group ref={ref}>
            <primitive ref={group} object={clone} scale={scale} />
        </group>
    )
}

// Solo fish scattered the length of the corridor, alternating tuna/loner so
// it's not the same species over and over, offset to alternating sides so
// nothing clips through the UpBlock/LineHouse/Rague structures sitting on
// the centerline.
function soloAt(x, side, seed) {
    const z = corridorZ(x) + side * (2.2 + (seed % 4) * 0.3)
    const y = corridorY(x) + 0.35
    const model = seed % 2 === 0 ? MODELS.tuna : MODELS.loner
    const scale = model === MODELS.tuna ? 0.1 + (seed % 3) * 0.014 : 0.3 + (seed % 3) * 0.03
    return { model, center: [x, y, z], scale, seed }
}

const SOLO_POSITIONS = [-6, -10.5, -15, -19.5, -24, -28.5, -33, -37.5, -42, -46.5, -51, -55.5, -60, -64.5, -69, -73.5, -78]

const SOLOS = SOLO_POSITIONS.flatMap((x, i) => [
    soloAt(x, 1, 100 + i * 2),
    soloAt(x, -1, 101 + i * 2),
])

// Real fish schools cruising open stretches of the corridor, alternating
// herring/tropical.
function cruiseAt(x, side, model, seed) {
    const z = corridorZ(x) + side * 3
    const y = corridorY(x) + 0.6
    return { model, center: [x, y, z], radius: 3 + (seed % 3) * 0.6, height: 1.2, speed: 0.08 + (seed % 4) * 0.02, scale: 1, seed }
}

const CRUISES = [
    cruiseAt(-8, -1, MODELS.herring, 301),
    cruiseAt(-21, 1, MODELS.tropical, 302),
    cruiseAt(-34, -1, MODELS.herring, 303),
    cruiseAt(-47, 1, MODELS.tropical, 304),
    cruiseAt(-59, -1, MODELS.herring, 305),
    cruiseAt(-71, 1, MODELS.tropical, 306),
]

// The two real schools that circle actual structures — one lap around
// UpBlock and one around the second Rague tier stack.
const CROWDS = [
    { model: MODELS.herring, structureCenter: [-10, -0.55, -7], radius: 4.5, height: 1.6, speed: 0.1, scale: 1, seed: 201 },
    { model: MODELS.tropical, structureCenter: [-65, -9.7, -2.0], radius: 4.5, height: 1.5, speed: -0.13, scale: 1, seed: 202 },
]

export default function SchoolFishes() {
    return (
        <group>
            {SOLOS.map((s, i) => (
                <SoloFish key={i} model={s.model} center={s.center} scale={s.scale} seed={s.seed} />
            ))}
            {CRUISES.map((c, i) => (
                <SchoolCruise
                    key={i}
                    model={c.model}
                    center={c.center}
                    radius={c.radius}
                    height={c.height}
                    speed={c.speed}
                    scale={c.scale}
                    seed={c.seed}
                />
            ))}
            {CROWDS.map((c, i) => (
                <SchoolCruise
                    key={`crowd-${i}`}
                    model={c.model}
                    center={c.structureCenter}
                    radius={c.radius}
                    height={c.height}
                    speed={c.speed}
                    scale={c.scale}
                    seed={c.seed}
                />
            ))}
        </group>
    )
}

useGLTF.preload(MODELS.tuna)
useGLTF.preload(MODELS.loner)
useGLTF.preload(MODELS.herring)
useGLTF.preload(MODELS.tropical)
