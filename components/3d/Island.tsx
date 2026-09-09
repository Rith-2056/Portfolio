"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import { mat, geo, palette } from "@/lib/materials";
import { ISLAND_RADIUS, zones } from "@/data/zones";
import { propColliders } from "@/lib/physics";
import { useStore } from "@/lib/store";

const R = ISLAND_RADIUS;

/** Flat path slabs from the hub to each zone so the layout reads at a glance. */
function Paths() {
  const items = useMemo(() => {
    return zones
      .filter((z) => z.id !== "about")
      .map((z) => {
        const [x, zz] = z.position;
        const len = Math.hypot(x, zz) - z.colliderRadius - 1.6;
        const angle = Math.atan2(x, zz);
        return { key: z.id, x: x / 2, z: zz / 2, len, angle };
      });
  }, []);
  return (
    <group>
      {items.map((p) => (
        <mesh
          key={p.key}
          position={[p.x, 0.012, p.z]}
          rotation={[-Math.PI / 2, 0, -p.angle]}
          material={mat.groundEdge}
          receiveShadow
        >
          <planeGeometry args={[1.4, p.len]} />
        </mesh>
      ))}
    </group>
  );
}

/** Small rock shards orbiting the island, slowly bobbing. */
function FloatingShards({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const arr: { r: number; a: number; y: number; s: number; phase: number; spin: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        r: R + 6 + Math.random() * 14,
        a: (i / count) * Math.PI * 2 + Math.random() * 0.5,
        y: -6 + Math.random() * 14,
        s: 0.5 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        spin: 0.05 + Math.random() * 0.15,
      });
    }
    return arr;
  }, [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    data.forEach((d, i) => {
      const a = d.a + t * 0.006;
      dummy.position.set(Math.sin(a) * d.r, d.y + Math.sin(t * 0.5 + d.phase) * 0.6, Math.cos(a) * d.r);
      dummy.rotation.set(t * d.spin, t * d.spin * 0.7, 0);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo.dodeca, mat.rock, count]} frustumCulled={false} />;
}

/** Decorative boulders on the island surface (matched by physics colliders). */
function Props() {
  return (
    <group>
      {propColliders.map((p, i) => (
        <mesh
          key={i}
          geometry={geo.dodeca}
          material={mat.dark2}
          position={[p.x, p.r * 0.45, p.z]}
          scale={[p.r * 1.05, p.r * 0.7, p.r * 1.05]}
          rotation={[0.2 * i, 0.7 * i, 0]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

export function Island() {
  const tier = useStore((s) => s.perfTier);
  const edgeRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (edgeRef.current) {
      const m = edgeRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * 0.8) * 0.15;
    }
  });

  return (
    <group>
      {/* top plate */}
      <mesh position={[0, -0.7, 0]} material={mat.ground} receiveShadow>
        <cylinderGeometry args={[R + 0.6, R + 0.2, 1.4, 14]} />
      </mesh>
      {/* rim */}
      <mesh position={[0, -1.5, 0]} material={mat.groundEdge}>
        <cylinderGeometry args={[R + 0.2, R - 1.4, 0.4, 14]} />
      </mesh>
      {/* underside rock */}
      <mesh position={[0, -9.4, 0]} material={mat.rock}>
        <coneGeometry args={[R - 1.2, 15.5, 14]} />
      </mesh>
      {/* emissive edge line */}
      <mesh ref={edgeRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R + 0.35, R + 0.6, 64]} />
        <meshStandardMaterial
          color={palette.accentDim}
          emissive={palette.accent}
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* engineering grid on the surface */}
      <Grid
        position={[0, 0.005, 0]}
        args={[R * 2 + 1, R * 2 + 1]}
        cellSize={2}
        cellThickness={0.6}
        cellColor="#1d1f24"
        sectionSize={8}
        sectionThickness={1}
        sectionColor="#2a2d34"
        fadeDistance={70}
        fadeStrength={1.2}
        infiniteGrid={false}
        followCamera={false}
      />
      <Paths />
      <Props />
      {tier !== "low" && <FloatingShards count={tier === "high" ? 18 : 10} />}
    </group>
  );
}
