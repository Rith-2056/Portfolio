"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat, geo, palette } from "@/lib/materials";
import { Zone } from "../Zone";
import { zoneById } from "@/data/zones";
import { useStore } from "@/lib/store";

const zone = zoneById.projects;

/** Floating browser window: ZooReviews. */
function BrowserArtifact() {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!g.current) return;
    g.current.position.y = 2.0 + Math.sin(t * 1.1) * 0.08;
    g.current.rotation.y = -0.4 + Math.sin(t * 0.5) * 0.12;
  });
  return (
    <group ref={g} position={[-1.35, 2.0, 0.1]}>
      <mesh geometry={geo.box} material={mat.light} scale={[1.35, 0.95, 0.06]} castShadow />
      <mesh geometry={geo.box} material={mat.dark} position={[0, -0.06, 0.035]} scale={[1.23, 0.7, 0.01]} />
      <mesh geometry={geo.box} material={mat.dark2} position={[0, 0.38, 0.035]} scale={[1.23, 0.12, 0.01]} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} geometry={geo.sphereLow} material={i === 0 ? mat.accent : mat.mid} position={[-0.52 + i * 0.09, 0.38, 0.045]} scale={0.025} />
      ))}
      {/* content lines */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} geometry={geo.box} material={i === 1 ? mat.signalSoft : mat.mid} position={[-0.15 + (i % 2) * 0.05, 0.16 - i * 0.16, 0.045]} scale={[0.7 - (i % 3) * 0.15, 0.035, 0.005]} />
      ))}
      <mesh geometry={geo.box} material={mat.accent} position={[0.42, -0.2, 0.045]} scale={[0.25, 0.14, 0.005]} />
    </group>
  );
}

/** Small terminal cube: AI Mental Health Companion. */
function TerminalArtifact() {
  const g = useRef<THREE.Group>(null);
  const caret = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (g.current) {
      g.current.position.y = 1.75 + Math.sin(t * 1.4 + 1) * 0.07;
      g.current.rotation.y = t * 0.35;
    }
    if (caret.current) caret.current.visible = Math.floor(t * 2) % 2 === 0;
  });
  return (
    <group ref={g} position={[0.2, 1.75, 0.2]}>
      <mesh geometry={geo.box} material={mat.dark2} scale={[0.62, 0.62, 0.62]} castShadow />
      <mesh geometry={geo.plane} material={mat.holo} position={[0, 0, 0.32]} scale={[0.5, 0.5, 1]} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} geometry={geo.box} material={mat.signal} position={[-0.12 + i * 0.03, 0.14 - i * 0.1, 0.33]} scale={[0.2 - i * 0.04, 0.02, 0.005]} />
      ))}
      <mesh ref={caret} geometry={geo.box} material={mat.accent} position={[-0.1, -0.16, 0.33]} scale={[0.04, 0.05, 0.005]} />
      <mesh geometry={geo.sphereLow} material={mat.accent} position={[0.24, 0.24, 0.32]} scale={0.03} />
    </group>
  );
}

/** Rotating network of user nodes: SkillSwap. */
function NetworkArtifact() {
  const g = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
    const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.55, Math.sin(i * 2.1) * 0.22, Math.sin(a) * 0.55));
    }
    return pts;
  }, []);
  const lines = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const arr: number[] = [];
    for (let i = 1; i < nodes.length; i++) {
      arr.push(0, 0, 0, nodes[i].x, nodes[i].y, nodes[i].z);
      const j = i === nodes.length - 1 ? 1 : i + 1;
      arr.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
    }
    geom.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return new THREE.LineSegments(geom, mat.lineSignal);
  }, [nodes]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (g.current) {
      g.current.rotation.y = -t * 0.4;
      g.current.rotation.x = Math.sin(t * 0.3) * 0.25;
      g.current.position.y = 1.95 + Math.sin(t * 1.2 + 2) * 0.07;
    }
  });
  return (
    <group ref={g} position={[1.55, 1.95, -0.1]}>
      <primitive object={lines} />
      {nodes.map((p, i) => (
        <mesh key={i} geometry={geo.sphereLow} material={i === 0 ? mat.accent : mat.light} position={p} scale={i === 0 ? 0.09 : 0.06} />
      ))}
    </group>
  );
}

export function Workshop() {
  const tier = useStore((s) => s.perfTier);
  return (
    <Zone zone={zone} labelHeight={4.2}>
      {/* workbench */}
      <mesh geometry={geo.box} material={mat.dark2} position={[0, 0.95, 0]} scale={[4.6, 0.14, 1.9]} castShadow receiveShadow />
      {[
        [-2.1, -0.8],
        [2.1, -0.8],
        [-2.1, 0.8],
        [2.1, 0.8],
      ].map(([x, z], i) => (
        <mesh key={i} geometry={geo.box} material={mat.mid} position={[x, 0.45, z]} scale={[0.12, 0.9, 0.12]} />
      ))}
      {/* pegboard */}
      <mesh geometry={geo.box} material={mat.dark} position={[0, 2.1, -1.1]} scale={[4.6, 2.4, 0.08]} />
      <mesh geometry={geo.plane} material={mat.wire} position={[0, 2.1, -1.05]} scale={[4.4, 2.2, 1]} />
      {/* tools on the board */}
      <mesh geometry={geo.box} material={mat.light} position={[-1.7, 2.5, -1.0]} scale={[0.08, 0.7, 0.06]} />
      <mesh geometry={geo.box} material={mat.light} position={[-1.45, 2.4, -1.0]} scale={[0.08, 0.5, 0.06]} />
      <mesh geometry={geo.cylLow} material={mat.mid} position={[1.7, 2.6, -1.0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.22, 0.06, 0.22]} />
      <mesh geometry={geo.box} material={mat.accent} position={[1.7, 2.6, -0.96]} scale={[0.06, 0.06, 0.02]} />
      {/* bench props */}
      <mesh geometry={geo.box} material={mat.mid} position={[-1.9, 1.12, 0.5]} scale={[0.5, 0.2, 0.35]} />
      <mesh geometry={geo.cylLow} material={mat.light} position={[1.9, 1.15, 0.55]} scale={[0.14, 0.26, 0.14]} />
      {/* lamp */}
      <mesh geometry={geo.box} material={mat.mid} position={[2.05, 1.7, -0.7]} rotation={[0, 0, 0.35]} scale={[0.06, 1.4, 0.06]} />
      <mesh geometry={geo.cylLow} material={mat.dark2} position={[1.75, 2.35, -0.6]} rotation={[0.5, 0, 0.9]} scale={[0.22, 0.26, 0.22]} />
      <BrowserArtifact />
      <TerminalArtifact />
      <NetworkArtifact />
      {tier !== "low" && <pointLight position={[1.4, 2.2, -0.2]} color={palette.accent} intensity={4} distance={7} decay={2} />}
    </Zone>
  );
}
