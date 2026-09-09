"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat, geo, palette } from "@/lib/materials";
import { Zone } from "../Zone";
import { zoneById } from "@/data/zones";
import { skills, skillGroups } from "@/data/skills";
import { useStore } from "@/lib/store";
import { roverState } from "../roverState";
import { damp } from "@/lib/physics";

const zone = zoneById.skills;
const groupColors = [new THREE.Color("#e8e6e1"), new THREE.Color(palette.signal), new THREE.Color(palette.accent), new THREE.Color("#9a9790")];

/** Technology constellation: a rotating cloud of nodes above an obelisk terminal. */
export function Constellation() {
  const cloud = useRef<THREE.Group>(null);
  const inst = useRef<THREE.InstancedMesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const anim = useRef({ spin: 0.12 });
  const tier = useStore((s) => s.perfTier);
  const reduced = useStore((s) => s.reducedMotion);

  const { points, lines } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const n = skills.length;
    // fibonacci sphere for even distribution
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      const rad = 1.7 + ((i * 7) % 5) * 0.14;
      pts.push(new THREE.Vector3(Math.cos(th) * r * rad, y * rad * 0.9, Math.sin(th) * r * rad));
    }
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (pts[i].distanceTo(pts[j]) < 1.25) arr.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return { points: pts, lines: new THREE.LineSegments(g, mat.lineSignal) };
  }, []);

  useLayoutEffect(() => {
    const m = inst.current;
    if (!m) return;
    const d = new THREE.Object3D();
    points.forEach((p, i) => {
      d.position.copy(p);
      d.scale.setScalar(0.07 + (i % 3) * 0.02);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, groupColors[skillGroups.indexOf(skills[i].group)]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [points]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const d = Math.hypot(roverState.x - zone.position[0], roverState.z - zone.position[1]);
    const near = d < zone.triggerRadius + 2;
    const active = useStore.getState().activeSection === zone.id;
    anim.current.spin = damp(anim.current.spin, reduced ? 0 : active ? 0.6 : near ? 0.35 : 0.12, 2, dt);
    if (cloud.current) {
      cloud.current.rotation.y += anim.current.spin * dt;
      cloud.current.position.y = 4.1 + Math.sin(t * 0.8) * 0.1;
    }
    if (shell.current) {
      shell.current.rotation.y -= anim.current.spin * 0.5 * dt;
      shell.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
    (lines.material as THREE.LineBasicMaterial).opacity = 0.2 + (near || active ? 0.3 : 0) + Math.sin(t * 2) * 0.05;
  });

  return (
    <Zone zone={zone} labelHeight={7.2} markerRadius={2.4}>
      {/* obelisk terminal */}
      <mesh geometry={geo.cylLow} material={mat.dark2} position={[0, 0.9, 0]} scale={[0.7, 1.8, 0.7]} castShadow />
      <mesh geometry={geo.cylLow} material={mat.mid} position={[0, 1.85, 0]} scale={[0.5, 0.12, 0.5]} />
      <mesh geometry={geo.box} material={mat.accent} position={[0, 1.2, 0.62]} scale={[0.22, 0.6, 0.04]} />
      <mesh geometry={geo.cylLow} material={mat.dark} position={[0, 0.06, 0]} scale={[1.5, 0.12, 1.5]} receiveShadow />
      {/* beam from terminal to the cloud */}
      <mesh geometry={geo.cylLow} material={mat.holo} position={[0, 3, 0]} scale={[0.05, 2.4, 0.05]} />
      {/* constellation */}
      <group ref={cloud} position={[0, 4.1, 0]}>
        <instancedMesh ref={inst} args={[geo.sphereLow, mat.bone, skills.length]} />
        <primitive object={lines} />
      </group>
      <mesh ref={shell} geometry={geo.ico} material={mat.wire} position={[0, 4.1, 0]} scale={2.7} />
      {tier !== "low" && <pointLight position={[0, 4.2, 0]} color={palette.signal} intensity={5} distance={10} decay={2} />}
    </Zone>
  );
}
