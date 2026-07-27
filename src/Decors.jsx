import Rays from "./decors/Rays"
import Floor from "./decors/Floor"
import Water from "./decors/Water"
import EnvMap from './decors/EnvMap'
import Rocks from "./decors/Rocks"
import Algues from "./decors/Algues"
import SchoolFishes from "./decors/SchoolFishes"
import Phyto from "./decors/Phyto"

export default function Decors() {
    return (
        <>
            <EnvMap />
            <Water
                position={[0, 3, 0]}
                rotation={[Math.PI * 0.5, 0, 0]}
            />
            <Rays
                position={[-100, -50, 0]}
                rotation={[0, Math.PI * 0.43, -0.3]}
                scale={[140, 40, 1]}
            />
            <Phyto />
            <Floor />
            <Rocks />
            <Algues />
            <SchoolFishes />
        </>
    )
}
