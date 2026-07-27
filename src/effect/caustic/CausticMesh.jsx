import CausticMaterial from './CausticMaterial.jsx'

export default function CausticMesh({
    geometry,
    texture,
    position = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
}) {
    return (
        <mesh geometry={geometry} position={position} scale={scale} rotation={rotation} receiveShadow>
            <CausticMaterial texture={texture} />
        </mesh>
    )
}
