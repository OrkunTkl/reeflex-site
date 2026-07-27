import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
export default function WaveController({ materialRef, active, duration = 1 }) {
  const start = useRef(0);
  const target = useRef(0);
  const progress = useRef(0);
  const animating = useRef(false);
  useEffect(() => {
    if (!materialRef.current) return;
    start.current = materialRef.current.uniforms.uBigWavesAmplitude.value;
    target.current = active ? 0.1 : 1.0;
    progress.current = 0;
    animating.current = true;
  }, [active]);
  useFrame((state, delta) => {
    if (!materialRef.current || !animating.current) return;
    progress.current += delta / duration;
    const t = Math.min(progress.current, 1);
    const value = THREE.MathUtils.lerp(start.current, target.current, t);
    materialRef.current.uniforms.uBigWavesAmplitude.value = value;
    if (t >= 1) {
      animating.current = false;
    }
  });
  return null;
}
