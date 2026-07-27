import ReefLattice from '../components/ReefLattice.jsx'

// Real UpBlock.jsx places 3 instances of the actual UpBlock.glb 2 units
// apart at these exact coordinates. Our procedural substitute is scaled
// down so the three clusters read as distinct modules instead of merging
// into one blob at that tight spacing.
export default function UpBlock() {
    return (
        <>
            <ReefLattice position={[-10, -0.8, -7]} scale={0.34} columns={5} />
            <ReefLattice position={[-12, -0.8, -7]} scale={0.3} columns={5} />
            <ReefLattice position={[-8, -0.8, -7]} scale={0.3} columns={5} />
        </>
    )
}
