import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import CausticMaterial from '../effect/caustic/CausticMaterial.jsx';
import { createStoneTexture } from '../materials/proceduralTextures.js';
import { CoralCluster, AlgaeSpeckles } from './ReefGrowth.jsx';

export default function ReefLineHouse({ position = [0, 0, 0], length = 8, piles = 9, height = 3 }) {
  const stoneTexture = useMemo(() => createStoneTexture(), []);
  useEffect(() => {
    stoneTexture.repeat.set(1, 8);
    stoneTexture.needsUpdate = true;
  }, [stoneTexture]);

  // Piles extend BELOW y=0 (buried in the sand) so they read as driven into
  // the seafloor instead of floating on top of it. Slight taper + a bit
  // more radius so they read as old worn stone posts rather than thin
  // plastic pipe.
  const buried = 0.7;
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.1, 0.14, height + buried, 8);
    g.translate(0, height / 2 - buried, 0);
    return g;
  }, [height]);

  const railGeo = useMemo(() => new THREE.BoxGeometry(length, 0.08, 0.08), [length]);

  // Small flattened silt mound at each pile base, selling the "driven into
  // the sand" look instead of a hard, floating cylinder edge.
  const moundGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(0.22, 8, 6);
    g.scale(1, 0.35, 1);
    return g;
  }, []);

  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < piles; i++) {
      const x = (i / (piles - 1)) * length - length / 2;
      arr.push(x);
    }
    return arr;
  }, [piles, length]);

  // Anchor points for coral/algae growth — base of every pile, plus the
  // two rail lines running along the top.
  const anchors = useMemo(
    () => positions.map((x) => ({ position: [x, 0.05, 0], radius: 0.24, yJitter: 0.1 })),
    [positions]
  );
  const railAnchors = useMemo(
    () => [
      { position: [0, height * 0.35, 0], radius: length * 0.5, yScale: 0.3 },
      { position: [0, height * 0.85, 0], radius: length * 0.5, yScale: 0.3 },
    ],
    [length, height]
  );

  return (
    <group position={position}>
      {positions.map((x, i) => (
        <group key={i}>
          <mesh geometry={geo} position={[x, 0, 0]} castShadow receiveShadow>
            <CausticMaterial texture={stoneTexture} color="#b7ae98" roughness={0.95} />
          </mesh>
          <mesh geometry={moundGeo} position={[x, 0.02, 0]} receiveShadow>
            <meshStandardMaterial color="#cabf8a" roughness={1} />
          </mesh>
        </group>
      ))}
      <mesh geometry={railGeo} position={[0, height * 0.35, 0]} castShadow>
        <CausticMaterial texture={stoneTexture} color="#a8a08d" roughness={0.95} />
      </mesh>
      <mesh geometry={railGeo} position={[0, height * 0.85, 0]} castShadow>
        <CausticMaterial texture={stoneTexture} color="#a8a08d" roughness={0.95} />
      </mesh>
      <CoralCluster anchors={anchors} seed={Math.round(length * 97 + piles)} perAnchor={1} scaleRange={[0.1, 0.2]} />
      <AlgaeSpeckles anchors={[...anchors, ...railAnchors]} seed={Math.round(length * 53 + piles)} count={110} spread={0.5} />
    </group>
  );
}
