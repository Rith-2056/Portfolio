"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat, geo, palette } from "@/lib/materials";
import { Zone } from "../Zone";
import { zoneById } from "@/data/zones";
import { useStore } from "@/lib/store";
import { roverState } from "../roverState";
import { damp } from "@/lib/physics";

const zone = zoneById.research;

type LegRefs = { hip: THREE.Group | null; knee: THREE.Group | null };

/** A small quadruped that idles, then trots and turns when the lab is activated. */
function Quadruped() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legs = useRef<LegRefs[]>([
    { hip: null, knee: null },
    { hip: null, knee: null },
    { hip: null, knee: null },
    { hip: null, knee: null },
  ]);
  const anim = useRef({ gait: 0, yaw: 0 });
  const reduced = useStore((s) => s.reducedMotion);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const s = useStore.getState();
    const active = s.activeSection === zone.id;
    const d = Math.hypot(roverState.x - zone.position[0], roverState.z - zone.position[1]);
    const near = d < zone.triggerRadius + 1.5;
    const targetGait = reduced ? 0 : active ? 1 : near ? 0.7 : 0;
    const a = anim.current;
    a.gait = damp(a.gait, targetGait, 2.5, dt);

    if (active && !reduced) a.yaw += dt * 0.9;
    if (root.current) root.current.rotation.y = a.yaw;

    const freq = 7;
    if (body.current) {
      const idle = Math.sin(t * 1.6) * 0.015;
      const bob = Math.abs(Math.sin(t * freq)) * 0.05 * a.gait;
      body.current.position.y = 0.52 + idle + bob;
      body.current.rotation.z = Math.sin(t * freq * 0.5) * 0.03 * a.gait;
      body.current.rotation.x = Math.sin(t * 1.1) * 0.01;
    }
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.7) * 0.35 * (1 - a.gait * 0.6);
      head.current.rotation.x = Math.sin(t * 1.3) * 0.1;
    }
    legs.current.forEach((l, i) => {
      // diagonal pairs move together (trot)
      const phase = i === 0 || i === 3 ? 0 : Math.PI;
      const swing = Math.sin(t * freq + phase);
      const idleSway = Math.sin(t * 1.6 + i) * 0.03;
      if (l.hip) l.hip.rotation.x = idleSway + swing * 0.45 * a.gait;
      if (l.knee) l.knee.rotation.x = -0.35 + Math.max(0, Math.cos(t * freq + phase)) * 0.9 * a.gait;
    });
  });

  const legPositions: [number, number][] = [
    [0.32, 0.28],
    [-0.32, 0.28],
    [0.32, -0.28],
    [-0.32, -0.28],
  ];

  return (
    <group ref={root} position={[0, 0, 0.4]}>
      <group ref={body}>
        {/* torso */}
        <mesh geometry={geo.box} material={mat.light} scale={[0.62, 0.26, 1.0]} castShadow />
        <mesh geometry={geo.box} material={mat.dark2} position={[0, 0.16, 0]} scale={[0.4, 0.08, 0.7]} />
        {/* sensor head */}
        <group ref={head} position={[0, 0.06, 0.58]}>
          <mesh geometry={geo.box} material={mat.dark2} scale={[0.3, 0.22, 0.26]} castShadow />
          <mesh geometry={geo.box} material={mat.signal} position={[0, 0.02, 0.14]} scale={[0.18, 0.05, 0.02]} />
        </group>
        {/* status light */}
        <mesh geometry={geo.sphereLow} material={mat.accent} position={[0, 0.22, -0.3]} scale={0.05} />
        {/* legs */}
        {legPositions.map(([x, z], i) => (
          <group
            key={i}
            position={[x, -0.08, z]}
            ref={(g) => {
              legs.current[i].hip = g;
            }}
          >
            <mesh geometry={geo.box} material={mat.dark2} position={[0, -0.16, 0]} scale={[0.1, 0.34, 0.12]} castShadow />
            <group
              position={[0, -0.32, 0]}
              ref={(g) => {
                legs.current[i].knee = g;
              }}
            >
              <mesh geometry={geo.box} material={mat.mid} position={[0, -0.16, 0.02]} scale={[0.07, 0.34, 0.08]} castShadow />
              <mesh geometry={geo.sphereLow} material={mat.accent} position={[0, -0.34, 0.02]} scale={0.05} />
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

/** Two-segment manipulator that slowly sweeps. */
function Arm() {
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const reduced = useStore((s) => s.reducedMotion);
  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    if (shoulder.current) {
      shoulder.current.rotation.y = Math.sin(t * 0.4) * 0.9;
      shoulder.current.rotation.z = -0.5 + Math.sin(t * 0.6) * 0.25;
    }
    if (elbow.current) elbow.current.rotation.z = 1.1 + Math.sin(t * 0.6 + 1) * 0.5;
  });
  return (
    <group position={[-2.3, 0, -1.6]}>
      <mesh geometry={geo.cyl} material={mat.dark2} position={[0, 0.25, 0]} scale={[0.45, 0.5, 0.45]} castShadow />
      <group ref={shoulder} position={[0, 0.5, 0]}>
        <mesh geometry={geo.box} material={mat.light} position={[0, 0.6, 0]} scale={[0.16, 1.2, 0.16]} castShadow />
        <group ref={elbow} position={[0, 1.2, 0]}>
          <mesh geometry={geo.box} material={mat.mid} position={[0, 0.45, 0]} scale={[0.12, 0.9, 0.12]} castShadow />
          <mesh geometry={geo.box} material={mat.accent} position={[0, 0.92, 0]} scale={[0.2, 0.08, 0.2]} />
        </group>
      </group>
    </group>
  );
}

export function RoboticsLab() {
  const holo = useRef<THREE.Mesh>(null);
  const tier = useStore((s) => s.perfTier);
  useFrame(({ clock }) => {
    if (holo.current) {
      holo.current.position.y = 2.2 + Math.sin(clock.elapsedTime * 1.2) * 0.08;
      (holo.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + Math.sin(clock.elapsedTime * 3) * 0.03;
    }
  });
  return (
    <Zone zone={zone} labelHeight={4.4}>
      {/* floor plate */}
      <mesh geometry={geo.box} material={mat.mid} position={[0, 0.06, 0]} scale={[7, 0.12, 6]} receiveShadow />
      <mesh geometry={geo.plane} material={mat.wire} position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[6.8, 5.8, 1]} />
      {/* corner posts and top frame */}
      {[
        [-3.3, -2.8],
        [3.3, -2.8],
        [-3.3, 2.8],
        [3.3, 2.8],
      ].map(([x, z], i) => (
        <mesh key={i} geometry={geo.box} material={mat.dark2} position={[x, 1.6, z]} scale={[0.14, 3.2, 0.14]} />
      ))}
      <mesh geometry={geo.box} material={mat.dark2} position={[0, 3.2, -2.8]} scale={[6.7, 0.1, 0.1]} />
      <mesh geometry={geo.box} material={mat.dark2} position={[0, 3.2, 2.8]} scale={[6.7, 0.1, 0.1]} />
      <mesh geometry={geo.box} material={mat.dark2} position={[-3.3, 3.2, 0]} scale={[0.1, 0.1, 5.7]} />
      <mesh geometry={geo.box} material={mat.dark2} position={[3.3, 3.2, 0]} scale={[0.1, 0.1, 5.7]} />
      {/* back wall panel */}
      <mesh geometry={geo.box} material={mat.dark} position={[0, 1.5, -2.85]} scale={[6.6, 2.9, 0.08]} />
      {/* holographic readout */}
      <mesh ref={holo} geometry={geo.plane} material={mat.holo} position={[1.6, 2.2, -2.6]} scale={[2.2, 1.2, 1]} />
      <mesh geometry={geo.plane} material={mat.wireSignal} position={[1.6, 2.2, -2.59]} scale={[2.2, 1.2, 1]} />
      {/* bench with parts */}
      <mesh geometry={geo.box} material={mat.dark2} position={[2.3, 0.45, 1.8]} scale={[1.8, 0.7, 0.9]} castShadow />
      <mesh geometry={geo.box} material={mat.light} position={[2.0, 0.9, 1.7]} scale={[0.3, 0.2, 0.3]} />
      <mesh geometry={geo.cylLow} material={mat.mid} position={[2.7, 0.95, 1.9]} scale={[0.12, 0.3, 0.12]} />
      <Quadruped />
      <Arm />
      {tier !== "low" && <pointLight position={[0, 3, 0]} color={palette.signal} intensity={5} distance={9} decay={2} />}
    </Zone>
  );
}
