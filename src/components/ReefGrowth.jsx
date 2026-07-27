import { useMemo, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { mulberry32 } from '../utils/corridor.js';

// Small coral models we already have on disk — scattered onto the reef
// structures so they read as colonized ruins instead of bare geometry.
//
// IMPORTANT: fossil_coral_1 (~1.1M verts / 73MB) and crescent_moon_coral
// (~240k verts / 16MB) are big single "hero" pieces, not lightweight
// accents — cloning them dozens of times across the scene is what was
// crashing/heavily lagging the site. Only coral_piece is cheap (~6k verts)
// and safe to repeat many times.
const CORAL_MODELS = [
  '/models/coral/coral_piece/scene.gltf',
];

function CoralInstance({ url, position, rotation, scale }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={clone} position={position} rotation={rotation} scale={scale} />;
}

// Scatters small coral models around a list of anchor points (pile bases,
// tier edges, column tops...) — deterministic per seed so placement is
// stable across re-renders instead of reshuffling.
export function CoralCluster({ anchors, seed = 1, perAnchor = 1, scaleRange = [0.12, 0.26] }) {
  const items = useMemo(() => {
    const rand = mulberry32(seed);
    const arr = [];
    anchors.forEach((a) => {
      const radius = a.radius ?? 0.22;
      const n = Math.max(1, Math.round(perAnchor * (0.4 + rand() * 0.6)));
      for (let i = 0; i < n; i++) {
        const model = CORAL_MODELS[Math.floor(rand() * CORAL_MODELS.length)];
        const angle = rand() * Math.PI * 2;
        const r = rand() * radius;
        arr.push({
          model,
          position: [
            a.position[0] + Math.cos(angle) * r,
            a.position[1] + (a.yJitter ?? 0.05) * (rand() - 0.2),
            a.position[2] + Math.sin(angle) * r,
          ],
          rotation: [0, rand() * Math.PI * 2, 0],
          scale: scaleRange[0] + rand() * (scaleRange[1] - scaleRange[0]),
        });
      }
    });
    return arr;
  }, [anchors, seed, perAnchor, scaleRange]);

  return (
    <group>
      {items.map((it, i) => (
        <CoralInstance key={i} url={it.model} position={it.position} rotation={it.rotation} scale={it.scale} />
      ))}
    </group>
  );
}

// Fine-grained always-visible moss/barnacle speckle, instanced for
// performance. Mixes mossy greens and rusty barnacle tones so the growth
// doesn't read as a single flat tint.
export function AlgaeSpeckles({ anchors, seed = 1, count = 150, spread = 0.4 }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() => {
    const rand = mulberry32(seed);
    const arr = [];
    for (let i = 0; i < count; i++) {
      const a = anchors[Math.floor(rand() * anchors.length)];
      arr.push({
        position: [
          a.position[0] + (rand() - 0.5) * spread,
          a.position[1] + (rand() - 0.5) * spread * (a.yScale ?? 1),
          a.position[2] + (rand() - 0.5) * spread,
        ],
        scale: 0.014 + rand() * 0.032,
        color:
          rand() > 0.45
            ? [0.18 + rand() * 0.14, 0.32 + rand() * 0.2, 0.11 + rand() * 0.1] // mossy green
            : [0.5 + rand() * 0.18, 0.32 + rand() * 0.14, 0.2 + rand() * 0.1], // rusty barnacle
      });
    }
    return arr;
  }, [anchors, seed, count, spread]);

  useEffect(() => {
    if (!ref.current) return;
    data.forEach((d, i) => {
      dummy.position.set(...d.position);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      ref.current.setColorAt(i, new THREE.Color(...d.color));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [data, dummy]);

  return (
    <instancedMesh ref={ref} args={[null, null, count]} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  );
}

CORAL_MODELS.forEach((m) => useGLTF.preload(m));
