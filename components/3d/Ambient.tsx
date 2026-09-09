"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat, geo } from "@/lib/materials";
import { useStore } from "@/lib/store";

/** Slowly rising dust motes across the island. */
export function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const reduced = useStore((s) => s.reducedMotion);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = Math.random() * 18 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
      speeds[i] = 0.15 + Math.random() * 0.35;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((_, dt) => {
    if (reduced) return;
    const p = ref.current;
    if (!p) return;
    const arr = p.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.5 + i) * dt * 0.08;
      if (arr[i * 3 + 1] > 16) arr[i * 3 + 1] = -2;
    }
    p.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#e8e6e1"
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Low-poly clouds drifting far outside the island. */
export function Clouds({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const reduced = useStore((s) => s.reducedMotion);
  const clouds = useMemo(() => {
    const arr: { a: number; r: number; y: number; s: number; parts: [number, number, number, number][]; speed: number }[] = [];
    for (let i = 0; i < count; i++) {
      const parts: [number, number, number, number][] = [];
      const n = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < n; j++) {
        parts.push([(j - n / 2) * 1.6 + Math.random(), Math.random() * 0.5, (Math.random() - 0.5) * 1.4, 1 + Math.random() * 1.2]);
      }
      arr.push({
        a: (i / count) * Math.PI * 2,
        r: 34 + Math.random() * 16,
        y: 4 + Math.random() * 9,
        s: 1.2 + Math.random() * 1.4,
        parts,
        speed: 0.01 + Math.random() * 0.012,
      });
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (reduced) return;
    const g = group.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      const d = clouds[i];
      d.a += d.speed * dt;
      c.position.set(Math.sin(d.a) * d.r, d.y, Math.cos(d.a) * d.r);
    });
  });

  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[Math.sin(c.a) * c.r, c.y, Math.cos(c.a) * c.r]} scale={c.s}>
          {c.parts.map((p, j) => (
            <mesh key={j} geometry={geo.ico} material={mat.dark2} position={[p[0], p[1], p[2]]} scale={[p[3], p[3] * 0.55, p[3]]} />
          ))}
        </group>
      ))}
    </group>
  );
}
