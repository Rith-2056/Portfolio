"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat, geo } from "@/lib/materials";
import { Zone } from "../Zone";
import { zoneById } from "@/data/zones";

const zone = zoneById.education;

/** Quiet academic pavilion with a floating terminal slab. */
export function Academy() {
  const slab = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (slab.current) {
      slab.current.position.y = 1.35 + Math.sin(t * 1.0) * 0.06;
      slab.current.rotation.y = Math.sin(t * 0.4) * 0.25;
    }
  });
  const cols: [number, number][] = [
    [-1.1, -1.1],
    [1.1, -1.1],
    [-1.1, 1.1],
    [1.1, 1.1],
  ];
  return (
    <Zone zone={zone} labelHeight={3.6}>
      <mesh geometry={geo.cyl} material={mat.dark} position={[0, 0.12, 0]} scale={[2.6, 0.24, 2.6]} receiveShadow />
      <mesh geometry={geo.cyl} material={mat.dark2} position={[0, 0.32, 0]} scale={[2.0, 0.16, 2.0]} receiveShadow />
      {cols.map(([x, z], i) => (
        <mesh key={i} geometry={geo.cyl} material={mat.light} position={[x, 1.3, z]} scale={[0.12, 1.8, 0.12]} castShadow />
      ))}
      <mesh geometry={geo.box} material={mat.dark2} position={[0, 2.3, 0]} scale={[3.0, 0.14, 3.0]} castShadow />
      <mesh geometry={geo.box} material={mat.mid} position={[0, 2.44, 0]} scale={[2.2, 0.14, 2.2]} />
      <group ref={slab} position={[0, 1.35, 0]}>
        <mesh geometry={geo.box} material={mat.dark2} scale={[1.0, 0.64, 0.06]} castShadow />
        <mesh geometry={geo.plane} material={mat.holo} position={[0, 0, 0.035]} scale={[0.86, 0.5, 1]} />
        {[0, 1, 2].map((i) => (
          <mesh key={i} geometry={geo.box} material={i === 0 ? mat.accent : mat.signal} position={[-0.2 + i * 0.04, 0.12 - i * 0.1, 0.04]} scale={[0.34 - i * 0.08, 0.02, 0.005]} />
        ))}
      </group>
    </Zone>
  );
}
