import ReefTierStack from '../components/ReefTierStack.jsx'

// Real Rague.jsx places 2 instances of the actual rague.glb at these exact
// coordinates/scales, with a complex 3-axis rotation tuned for that specific
// mesh's pivot. Our procedural substitute is a different shape, so we keep
// the real positions/scale but use a simple Y-axis facing rotation instead.
export default function Rague() {
    return (
        <>
            <group position={[-54.0, -9.4, -4.3]} rotation={[0, 1.8, 0]} scale={[1.0, 1.1, 1.0]}>
                <ReefTierStack scale={0.55} />
            </group>
            <group position={[-65.0, -10.0, -2.0]} rotation={[0, 0.6, 0]} scale={1.0}>
                <ReefTierStack scale={0.5} />
            </group>
        </>
    )
}
