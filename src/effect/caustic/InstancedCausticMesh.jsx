import { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CausticMaterial from './CausticMaterial.jsx'

export default function InstancedCausticMesh({ geometry, texture, count, matrices }) {
    const meshRef = useRef()
    const materialShaderRef = useRef()
    const causticOffset = useRef(new THREE.Vector2(0, 0))

    const { instanceMatrices, instanceSpheres } = useMemo(() => {
        geometry.computeBoundingSphere()
        const baseSphere = geometry.boundingSphere.clone()
        const tempPos = new THREE.Vector3()
        const tempQuat = new THREE.Quaternion()
        const tempScale = new THREE.Vector3()
        const matricesCopy = []
        const spheres = []
        matrices.forEach((mat) => {
            const matCopy = mat.clone()
            matricesCopy.push(matCopy)
            matCopy.decompose(tempPos, tempQuat, tempScale)
            const sph = baseSphere.clone()
            sph.center.copy(tempPos)
            sph.radius *= Math.max(tempScale.x, tempScale.y, tempScale.z)
            spheres.push(sph)
        })
        return { instanceMatrices: matricesCopy, instanceSpheres: spheres }
    }, [geometry, matrices])

    useEffect(() => {
        const mesh = meshRef.current
        if (!mesh) return
        instanceMatrices.forEach((mat, i) => mesh.setMatrixAt(i, mat))
        mesh.count = instanceMatrices.length
        mesh.instanceMatrix.needsUpdate = true
        mesh.frustumCulled = false
    }, [instanceMatrices])

    useEffect(() => {
        if (!texture) return
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.needsUpdate = true
    }, [texture])

    const projViewMat = useMemo(() => new THREE.Matrix4(), [])
    const frustum = useMemo(() => new THREE.Frustum(), [])

    useFrame((state, delta) => {
        const mesh = meshRef.current
        if (!mesh) return
        const camera = state.camera
        projViewMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        frustum.setFromProjectionMatrix(projViewMat)

        let visibleCount = 0
        instanceSpheres.forEach((sphere, i) => {
            if (frustum.intersectsSphere(sphere)) {
                mesh.setMatrixAt(visibleCount, instanceMatrices[i])
                visibleCount++
            }
        })
        mesh.count = visibleCount
        mesh.instanceMatrix.needsUpdate = true

        const shader = materialShaderRef.current
        if (shader) {
            shader.uniforms.uTime.value = state.clock.getElapsedTime()
            causticOffset.current.y += delta * 0.4
            shader.uniforms.uOffset.value = causticOffset.current
        }
    })

    return (
        <instancedMesh ref={meshRef} args={[geometry, undefined, count]} castShadow receiveShadow frustumCulled={false}>
            <CausticMaterial
                texture={texture}
                onBeforeCompile={(shader) => {
                    materialShaderRef.current = shader
                }}
            />
        </instancedMesh>
    )
}
