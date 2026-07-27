import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function FadingHtml({ position, children }) {
  const groupRef = useRef();
  const htmlRef = useRef();
  const { camera, gl, viewport } = useThree();
  const isMobile = viewport.width < 6;

  const fadeOutThreshold = isMobile ? 2.5 : 1.8;
  const fadeInStart = isMobile ? 4 : 4.3;
  const fadeOutThresholdSq = fadeOutThreshold * fadeOutThreshold;
  const fadeInStartSq = fadeInStart * fadeInStart;

  const isVisibleRef = useRef(false);
  const htmlPos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!groupRef.current || !htmlRef.current) return;
    groupRef.current.getWorldPosition(htmlPos.current);
    const distSq = camera.position.distanceToSquared(htmlPos.current);
    const shouldBeVisible = distSq > fadeOutThresholdSq && distSq < fadeInStartSq;
    if (shouldBeVisible !== isVisibleRef.current) {
      isVisibleRef.current = shouldBeVisible;
      if (shouldBeVisible) {
        htmlRef.current.classList?.add("visible");
      } else {
        htmlRef.current.classList?.remove("visible");
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Html
        ref={htmlRef}
        portal={{ current: gl.domElement.parentNode }}
        distanceFactor={isMobile ? 1.5 : 3}
        className="fading-html"
      >
        {children}
      </Html>
    </group>
  );
}
