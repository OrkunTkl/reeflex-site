import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { ScrollControls } from '@react-three/drei'
import PerformanceDetector from './utils/performance/PerformanceDetector'
import Decors from './Decors'
import CameraPath from './utils/CameraPath'
import UpBlock from './modules/UpBlock'
import LineHouse from './modules/LineHouse'
import Content from './content/Content.jsx'
import Rague from './modules/Rague'

export default function Experience() {
  const { scene, viewport } = useThree()
  const lightTarget = useRef()
  const isMobile = viewport.width < 6

  useEffect(() => {
    scene.fog = new THREE.Fog('#01657d', 0, 15)
  }, [scene])

  return (
    <>
      <ScrollControls pages={isMobile ? 30 : 10} damping={0.3} eps={0.0001}>
        <PerformanceDetector />
        <CameraPath />
        <Decors />
        <UpBlock />
        <LineHouse />
        <Rague />
        <Content />
        <ambientLight intensity={1.5} color={0xaef6f7} />
        <directionalLight
          castShadow
          position={[5, 10, 5]}
          intensity={3}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-camera-near={1}
          shadow-camera-far={60}
          color={0xaef6f7}
        />
        <object3D ref={lightTarget} position={[-38, -6.8, -8]} />
      </ScrollControls>
    </>
  )
}
