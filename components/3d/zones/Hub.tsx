"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat, geo, palette } from "@/lib/materials";
import { Zone } from "../Zone";
import { zoneById } from "@/data/zones";
import { useStore } from "@/lib/store";

const zone = zoneById.about;

/** Central hub: a rotating holographic core on a plinth. Represents "About". */
export function Hub() {
  const core = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const panels = useRef<THREE.Group>(null);
  const tier = useStore((s) => s.perfTier);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y = t * 0.25;
      core.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    }
    if (inner.current) {
      const s = 1 + Math.sin(t * 2) * 0.06;
      inner.current.scale.setScalar(s);
      (inner.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + Math.sin(t * 2) * 0.4;
    }
    if (ringA.current) {
      ringA.current.rotation.x = t * 0.5;
      ringA.current.rotation.y = t * 0.3;
    }
    if (ringB.current) {
      ringB.current.rotation.z = t * 0.4;
      ringB.current.rotation.x = -t * 0.35 + 1.2;
    }
    if (panels.current) panels.current.rotation.y = -t * 0.18;
  });

  return (
    <Zone zone={zone} labelHeight={4.2} markerRadius={2.6}>
      {/* plinth */}
      <mesh geometry={geo.cyl} material={mat.dark2} position={[0, 0.16, 0]} scale={[1.15, 0.32, 1.15]} receiveShadow castShadow />
      <mesh geometry={geo.cyl} material={mat.mid} position={[0, 0.36, 0]} scale={[0.85, 0.1, 0.85]} />
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.72, 32]} />
        <meshStandardMaterial color={palette.accentDim} emissive={palette.accent} emissiveIntensity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* core */}
      <mesh ref={core} geometry={geo.ico} material={mat.wireSignal} position={[0, 1.7, 0]} scale={0.85} />
      <mesh ref={inner} geometry={geo.sphere} material={mat.signal} position={[0, 1.7, 0]} scale={0.32} />
      <mesh ref={ringA} geometry={geo.torus} material={mat.light} position={[0, 1.7, 0]} scale={1.15} />
      <mesh ref={ringB} geometry={geo.torus} material={mat.mid} position={[0, 1.7, 0]} scale={1.4} />
      {/* orbiting holographic panels */}
      <group ref={panels} position={[0, 1.5, 0]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh
              key={i}
              geometry={geo.plane}
              material={mat.holo}
              position={[Math.sin(a) * 2.1, 0.3 + i * 0.25, Math.cos(a) * 2.1]}
              rotation={[0, a, 0]}
              scale={[0.9, 0.55, 1]}
            />
          );
        })}
      </group>
      {tier !== "low" && <pointLight position={[0, 2.2, 0]} color={palette.signal} intensity={6} distance={9} decay={2} />}
    </Zone>
  );
}
