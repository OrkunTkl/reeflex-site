import ReefLineHouse from '../components/ReefLineHouse.jsx'

// Real LineHouse.jsx places 3 instances of the actual LineHouse.glb at
// these exact coordinates, with a complex 3-axis rotation tuned for that
// specific mesh's pivot. Our procedural substitute is a different shape, so
// we keep the real positions but use a simple Y-axis facing rotation
// instead (the real rotation values would tip our placeholder oddly into
// the sand or sky). Length is kept modest so the 3 instances (~7-8 units
// apart) don't overlap each other.
export default function LineHouse() {
    return (
        <>
            <group position={[-28, -4.26, -9.5]} rotation={[0, 1.5, 0]}>
                <ReefLineHouse length={3.5} piles={5} height={1.8} />
            </group>
            <group position={[-35, -5.91, -13]} rotation={[0, 2.1, 0]}>
                <ReefLineHouse length={3.5} piles={5} height={1.8} />
            </group>
            <group position={[-38, -6.8, -8]} rotation={[0, 0.9, 0]}>
                <ReefLineHouse length={3.5} piles={5} height={1.8} />
            </group>
        </>
    )
}
