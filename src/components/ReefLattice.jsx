import { useMemo } from 'react';
import * as THREE from 'three';
import CausticMaterial from '../effect/caustic/CausticMaterial.jsx';
import { createStoneTexture } from '../materials/proceduralTextures.js';
import { CoralCluster, AlgaeSpeckles } from './ReefGrowth.jsx';

// One weathered stone column, lathed from a gently fluted profile — a few
// broad flutes like a classical ruin, not the dense mechanical ribbing that
// used to read as corrugated pipe.
function latticeColumnGeometry(height = 4, radius = 0.32, segments = 48) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * height;
    // slight barrel taper (thicker mid-column) plus a soft irregular wobble
    // so it reads as worn stone rather than a perfectly lathed part
    const taper = 1 + 0.05 * Math.sin(t * Math.PI);
    const wobble = 1 + 0.025 * Math.sin(t * 27.3);
    const r = radius * taper * wobble;
    points.push(new THREE.Vector2(r, y));
  }
  const geo = new THREE.LatheGeometry(points, 8, 0, Math.PI * 2 * 0.998);
  geo.translate(0, -height / 2, 0);
  return geo;
}

// Broken stone connecting braces between adjacent columns, in two height
// bands — reads as collapsed arch/rubble bridging rather than diagonal
// scaffold poles once it's thicker and stone-textured.
function computeBraces(positions, scale) {
  const braces = [];
  const bands = [
    [0.55 * scale, 1.9 * scale, 0.075 * scale],
    [1.9 * scale, 3.35 * scale, 0.065 * scale],
  ];
  const n = positions.length;
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < n; i++) {
    const p1 = positions[i];
    const p2 = positions[(i + 1) % n];
    bands.forEach(([yLow, yHigh, radius]) => {
      const pairs = [
        [new THREE.Vector3(p1[0], yLow, p1[2]), new THREE.Vector3(p2[0], yHigh, p2[2])],
        [new THREE.Vector3(p1[0], yHigh, p1[2]), new THREE.Vector3(p2[0], yLow, p2[2])],
      ];
      pairs.forEach(([a, b]) => {
        const dir = new THREE.Vector3().subVectors(b, a);
        const length = dir.length();
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
        braces.push({ mid: [mid.x, mid.y, mid.z], quat: [quat.x, quat.y, quat.z, quat.w], length, radius });
      });
    });
  }
  return braces;
}

export default function ReefLattice({ position = [0, 0, 0], scale = 1, columns = 7 }) {
  const geo = useMemo(() => latticeColumnGeometry(), []);
  const stoneTexture = useMemo(() => createStoneTexture(), []);
  const braceTexture = useMemo(() => stoneTexture.clone(), [stoneTexture]);
  useMemo(() => {
    stoneTexture.repeat.set(1, 6);
    stoneTexture.needsUpdate = true;
    braceTexture.repeat.set(1, 2.5);
    braceTexture.needsUpdate = true;
  }, [stoneTexture, braceTexture]);

  const positions = useMemo(() => {
    const arr = [];
    const r = 1.1 * scale;
    for (let i = 0; i < columns; i++) {
      const a = (i / columns) * Math.PI * 2;
      arr.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
    }
    return arr;
  }, [columns, scale]);

  const braces = useMemo(() => computeBraces(positions, scale), [positions, scale]);

  const columnAnchors = useMemo(
    () => positions.map((p) => ({ position: [p[0], 2 * scale, p[2]], radius: 0.5 * scale, yJitter: scale })),
    [positions, scale]
  );
  const baseAnchors = useMemo(
    () => positions.map((p) => ({ position: [p[0], -0.02, p[2]], radius: 0.4 * scale, yJitter: 0.1 })),
    [positions, scale]
  );

  return (
    <group position={position}>
      {positions.map((p, i) => (
        <mesh key={i} geometry={geo} position={[p[0], 2 * scale, p[2]]} scale={[scale, scale * 1.15, scale]} castShadow receiveShadow>
          <CausticMaterial texture={stoneTexture} color="#b0a890" roughness={0.95} metalness={0} />
        </mesh>
      ))}
      {braces.map((b, i) => (
        <mesh key={`brace-${i}`} position={b.mid} quaternion={b.quat} castShadow receiveShadow>
          <cylinderGeometry args={[b.radius, b.radius, b.length, 7]} />
          <CausticMaterial texture={braceTexture} color="#a39c86" roughness={0.95} metalness={0} />
        </mesh>
      ))}
      {positions.map((p, i) => (
        <mesh key={`mound-${i}`} position={[p[0], -0.02, p[2]]} scale={[0.5 * scale + 0.12, 0.14, 0.5 * scale + 0.12]} receiveShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#cabf8a" roughness={1} />
        </mesh>
      ))}
      <CoralCluster anchors={[...columnAnchors, ...baseAnchors]} seed={Math.round(scale * 6007 + columns)} perAnchor={1} scaleRange={[0.12, 0.24]} />
      <AlgaeSpeckles anchors={[...columnAnchors, ...baseAnchors]} seed={Math.round(scale * 3001 + columns)} count={220} spread={0.9 * scale + 0.3} />
    </group>
  );
}
