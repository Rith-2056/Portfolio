"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat, geo, palette } from "@/lib/materials";
import { Zone } from "../Zone";
import { zoneById } from "@/data/zones";
import { useStore } from "@/lib/store";

const zone = zoneById.contact;
const H = 8.5;

/** Lattice communications tower with a rotating dish and outgoing signal rings. */
export function CommsTower() {
  const dish = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Mesh[]>([]);
  const tier = useStore((s) => s.perfTier);
  const reduced = useStore((s) => s.reducedMotion);

  const guys = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      arr.push(0, H * 0.72, 0, Math.sin(a) * 2.6, 0.1, Math.cos(a) * 2.6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return new THREE.LineSegments(g, mat.lineDark);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (dish.current && !reduced) dish.current.rotation.y = t * 0.45;
    if (beacon.current) {
      const on = Math.sin(t * 4) > 0.6;
      (beacon.current.material as THREE.MeshStandardMaterial).emissiveIntensity = on ? 2.4 : 0.35;
    }
    rings.current.forEach((r, i) => {
      if (!r) return;
      const p = ((t * 0.35 + i / 3) % 1 + 1) % 1;
      r.scale.setScalar(0.3 + p * 3.2);
      (r.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.35;
      r.position.y = H + 0.25 + p * 0.6;
    });
  });

  return (
    <Zone zone={zone} labelHeight={H + 2.4} markerRadius={2.8}>
      <mesh geometry={geo.cyl} material={mat.dark2} position={[0, 0.15, 0]} scale={[1.4, 0.3, 1.4]} receiveShadow />
      {/* lattice tiers */}
      <mesh position={[0, 1.6, 0]} material={mat.wire}>
        <cylinderGeometry args={[0.55, 1.0, 3.2, 4, 3, true]} />
      </mesh>
      <mesh position={[0, 4.6, 0]} material={mat.wire}>
        <cylinderGeometry args={[0.32, 0.55, 2.8, 4, 3, true]} />
      </mesh>
      <mesh position={[0, 7.0, 0]} material={mat.wire}>
        <cylinderGeometry args={[0.12, 0.32, 2.0, 4, 2, true]} />
      </mesh>
      {/* solid mast */}
      <mesh geometry={geo.cylLow} material={mat.light} position={[0, H / 2, 0]} scale={[0.09, H, 0.09]} castShadow />
      {/* platform */}
      <mesh geometry={geo.box} material={mat.dark2} position={[0, 3.25, 0]} scale={[1.5, 0.08, 1.5]} />
      {/* dish */}
      <group ref={dish} position={[0, 6.0, 0]}>
        <group position={[0.42, 0, 0]} rotation={[0, 0, -1.15]}>
          <mesh material={mat.light}>
            <coneGeometry args={[0.48, 0.3, 14, 1, true]} />
          </mesh>
          <mesh material={mat.dark2} position={[0, -0.18, 0]}>
            <coneGeometry args={[0.5, 0.06, 14]} />
          </mesh>
          <mesh geometry={geo.cylLow} material={mat.mid} position={[0, 0.3, 0]} scale={[0.02, 0.5, 0.02]} />
          <mesh geometry={geo.sphereLow} material={mat.signal} position={[0, 0.56, 0]} scale={0.05} />
        </group>
        <mesh geometry={geo.box} material={mat.mid} position={[0.2, 0, 0]} scale={[0.4, 0.06, 0.06]} />
      </group>
      {/* beacon */}
      <mesh ref={beacon} geometry={geo.sphereLow} position={[0, H + 0.15, 0]} scale={0.14}>
        <meshStandardMaterial color={palette.accentDim} emissive={palette.accent} emissiveIntensity={1.5} />
      </mesh>
      {/* signal rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) rings.current[i] = m;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, H + 0.25, 0]}
        >
          <ringGeometry args={[0.9, 1, 48]} />
          <meshBasicMaterial color={palette.accent} transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <primitive object={guys} />
      {/* small equipment shed */}
      <mesh geometry={geo.box} material={mat.dark2} position={[1.9, 0.5, 1.2]} scale={[1.2, 1.0, 0.9]} castShadow />
      <mesh geometry={geo.box} material={mat.signal} position={[1.9, 0.7, 1.66]} scale={[0.3, 0.05, 0.02]} />
      {tier !== "low" && <pointLight position={[0, H + 0.3, 0]} color={palette.accent} intensity={4} distance={10} decay={2} />}
    </Zone>
  );
}
