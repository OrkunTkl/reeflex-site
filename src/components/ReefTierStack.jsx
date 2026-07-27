import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import CausticMaterial from '../effect/caustic/CausticMaterial.jsx';
import { createStoneTexture } from '../materials/proceduralTextures.js';
import { CoralCluster, AlgaeSpeckles } from './ReefGrowth.jsx';

function scallopedDiscGeometry(radius = 1.6, lobes = 10, thickness = 0.12) {
  const shape = new THREE.Shape();
  const steps = lobes * 8;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = radius * (1 + 0.08 * Math.sin(a * lobes));
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 32 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -thickness / 2, 0);
  return geo;
}

// Chunky, irregular stone support pillars between tiers — replaces the old
// thin "X" pipe-cross braces with something that reads as broken/weathered
// stone masonry rather than scaffolding.
function stoneSupportGeometry(height = 1.1, radius = 0.16) {
  const g = new THREE.CylinderGeometry(radius * 0.8, radius, height, 7);
  return g;
}

const TIERS = [
  { y: 0, radius: 1.9, lobes: 12 },
  { y: 1.25, radius: 1.5, lobes: 10 },
  { y: 2.5, radius: 1.0, lobes: 8 },
];

export default function ReefTierStack({ position = [0, 0, 0], scale = 1 }) {
  const discGeo = useMemo(() => TIERS.map((t) => scallopedDiscGeometry(t.radius, t.lobes)), []);
  const supportGeo = useMemo(() => stoneSupportGeometry(), []);
  const stoneTexture = useMemo(() => createStoneTexture(), []);
  const supportTexture = useMemo(() => stoneTexture.clone(), [stoneTexture]);
  useEffect(() => {
    stoneTexture.repeat.set(8, 0.2);
    stoneTexture.needsUpdate = true;
    supportTexture.repeat.set(1, 2.5);
    supportTexture.needsUpdate = true;
  }, [stoneTexture, supportTexture]);

  const anchors = useMemo(
    () =>
      TIERS.map((t) => ({
        position: [0, t.y, 0],
        radius: t.radius * 0.95,
        yJitter: 0.08,
      })),
    []
  );

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, -0.08, 0]} scale={[TIERS[0].radius * 1.15, 0.16, TIERS[0].radius * 1.15]} receiveShadow>
        <sphereGeometry args={[1, 10, 6]} />
        <meshStandardMaterial color="#cabf8a" roughness={1} />
      </mesh>
      {TIERS.map((t, i) => (
        <group key={i} position={[0, t.y, 0]}>
          <mesh geometry={discGeo[i]} castShadow receiveShadow>
            <CausticMaterial texture={stoneTexture} color="#b0a890" roughness={0.95} />
          </mesh>
          {i < TIERS.length - 1 &&
            [0, 1, 2, 3].map((leg) => {
              const a = (leg / 4) * Math.PI * 2 + 0.4;
              const r = t.radius * 0.6;
              return (
                <mesh
                  key={leg}
                  geometry={supportGeo}
                  position={[Math.cos(a) * r, 0.62, Math.sin(a) * r]}
                  castShadow
                >
                  <CausticMaterial texture={supportTexture} color="#a39c86" roughness={0.95} />
                </mesh>
              );
            })}
        </group>
      ))}
      <CoralCluster anchors={anchors} seed={Math.round(scale * 4001)} perAnchor={1} scaleRange={[0.14, 0.3]} />
      <AlgaeSpeckles anchors={anchors} seed={Math.round(scale * 2003)} count={160} spread={0.6} />
    </group>
  );
}
