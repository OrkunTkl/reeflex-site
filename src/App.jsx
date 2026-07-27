import './App.css'
import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import './i18n.js'
import Experience from './Experience.jsx'
import { LoadingScreen } from './LoadingScreen.jsx'
import SceneErrorBoundary from './SceneErrorBoundary.jsx'

function App() {
    const [start, setStart] = useState(false)

    function isSafari() {
        const ua = navigator.userAgent
        return /^((?!chrome|android).)*safari/i.test(ua)
    }

    return (
        <>
            <SceneErrorBoundary>
                <Canvas
                    shadows={{ type: THREE.PCFSoftShadowMap }}
                    camera={{
                        fov: 45,
                        near: 0.01,
                        far: 2000,
                        position: [-4, 3, 6],
                    }}
                    gl={isSafari() ? { powerPreference: 'high-performance' } : undefined}
                >
                    <color attach="background" args={['#01657d']} />
                    <Suspense fallback={null}>
                        <Experience />
                    </Suspense>
                </Canvas>
            </SceneErrorBoundary>

            <LoadingScreen started={start} onStarted={() => setStart(true)} />

            <div className="btn-container btn-logo-container">
                <div className="logo-icon-mark">R≈</div>
            </div>
        </>
    )
}

export default App
