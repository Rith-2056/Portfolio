"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat, geo, palette } from "@/lib/materials";
import { Zone } from "../Zone";
import { zoneById } from "@/data/zones";
import { useStore } from "@/lib/store";
import { roverState } from "../roverState";
import { damp } from "@/lib/physics";

const zone = zoneById.experience;
const RACK_X = [-2.4, -0.8, 0.8, 2.4];
const ROWS = 7;
const COLS = 3;
const LED_COUNT = RACK_X.length * ROWS * COLS;

const cSignal = new THREE.Color(palette.signal);
const cAccent = new THREE.Color(palette.accent);
const cOff = new THREE.Color("#2a2d33");

/** Four server racks, one per FishEye accomplishment. They light up as the rover approaches. */
export function DataCenter() {
  const leds = useRef<THREE.InstancedMesh>(null);
  const fan = useRef<THREE.Group>(null);
  const stream = useRef<THREE.Points>(null);
  const light = useRef<THREE.PointLight>(null);
  const tier = useStore((s) => s.perfTier);
  const reduced = useStore((s) => s.reducedMotion);
  const stripMats = useMemo(
    () =>
      RACK_X.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: palette.accentDim,
            emissive: palette.accent,
            emissiveIntensity: 0.15,
            roughness: 0.5,
          }),
      ),
    [],
  );
  const state = useRef({ prox: 0, lastBlink: 0 });
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const streamPositions = useMemo(() => {
    const n = 90;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = RACK_X[i % 4] + (Math.random() - 0.5) * 0.5;
      arr[i * 3 + 1] = Math.random() * 4;
      arr[i * 3 + 2] = -0.7 + (Math.random() - 0.5) * 0.3;
    }
    return arr;
  }, []);

  // initial LED layout
  useLayoutEffect(() => {
    const m = leds.current;
    if (!m) return;
    let i = 0;
    for (const rx of RACK_X) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          dummy.position.set(rx - 0.3 + c * 0.3, 0.45 + r * 0.3, 0.5);
          dummy.scale.set(0.16, 0.06, 0.02);
          dummy.updateMatrix();
          m.setMatrixAt(i, dummy.matrix);
          m.setColorAt(i, Math.random() > 0.7 ? cSignal : cOff);
          i++;
        }
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [dummy]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const st = state.current;
    const d = Math.hypot(roverState.x - zone.position[0], roverState.z - zone.position[1]);
    const active = useStore.getState().activeSection === zone.id;
    const target = active ? 1 : THREE.MathUtils.clamp(1 - (d - 3) / 9, 0, 1);
    st.prox = damp(st.prox, target, 3, dt);

    const highlight = useStore.getState().highlight;
    stripMats.forEach((m, i) => {
      const wave = active ? 0.6 + Math.sin(t * 3 + i * 1.3) * 0.4 : 0;
      const focus = active && highlight !== null ? (highlight === i ? 2.2 : -0.5) : 0;
      m.emissiveIntensity = Math.max(0.1, 0.12 + st.prox * 1.6 + wave + focus);
    });

    if (leds.current && !reduced && t - st.lastBlink > 0.12) {
      st.lastBlink = t;
      const m = leds.current;
      const flips = 2 + Math.floor(st.prox * 6);
      for (let k = 0; k < flips; k++) {
        const i = Math.floor(Math.random() * LED_COUNT);
        const r = Math.random();
        m.setColorAt(i, r < 0.55 + st.prox * 0.2 ? cSignal : r < 0.62 ? cAccent : cOff);
      }
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }

    if (fan.current) fan.current.rotation.y += dt * (2 + st.prox * 6);

    if (stream.current && !reduced) {
      const arr = stream.current.geometry.attributes.position.array as Float32Array;
      const speed = 0.6 + st.prox * 1.8;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3 + 1] += speed * dt * (0.6 + (i % 5) * 0.15);
        if (arr[i * 3 + 1] > 4) arr[i * 3 + 1] = 0.1;
      }
      stream.current.geometry.attributes.position.needsUpdate = true;
      (stream.current.material as THREE.PointsMaterial).opacity = 0.2 + st.prox * 0.6;
    }
    if (light.current) light.current.intensity = 1 + st.prox * 8;
  });

  return (
    <Zone zone={zone} labelHeight={4.6}>
      {/* floor slab */}
      <mesh geometry={geo.box} material={mat.dark} position={[0, 0.08, 0]} scale={[8.2, 0.16, 5]} receiveShadow />
      <mesh geometry={geo.plane} material={mat.wire} position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[8, 4.8, 1]} />
      {/* racks */}
      {RACK_X.map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh geometry={geo.box} material={mat.mid} position={[0, 1.5, 0]} scale={[1.15, 2.7, 1]} castShadow receiveShadow />
          {/* front panel inset */}
          <mesh geometry={geo.box} material={mat.dark2} position={[0, 1.5, 0.46]} scale={[1.0, 2.5, 0.06]} />
          {/* side vents */}
          <mesh geometry={geo.box} material={mat.mid} position={[0, 2.62, 0]} scale={[1.05, 0.08, 0.9]} />
          {/* status strip */}
          <mesh geometry={geo.box} material={stripMats[i]} position={[0, 2.78, 0]} scale={[0.9, 0.06, 0.6]} />
          {/* rack id notch */}
          <mesh geometry={geo.box} material={mat.light} position={[0.42, 0.28, 0.5]} scale={[0.1, 0.1, 0.02]} />
        </group>
      ))}
      <instancedMesh ref={leds} args={[geo.box, mat.bone, LED_COUNT]} />
      {/* cooling unit with fan */}
      <group position={[3.6, 0, -1.6]}>
        <mesh geometry={geo.box} material={mat.mid} position={[0, 0.6, 0]} scale={[1.2, 1.2, 1.2]} castShadow />
        <mesh geometry={geo.cyl} material={mat.dark} position={[0, 1.26, 0]} scale={[0.5, 0.12, 0.5]} />
        <group ref={fan} position={[0, 1.34, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} geometry={geo.box} material={mat.light} rotation={[0, (i / 3) * Math.PI, 0]} scale={[0.82, 0.03, 0.14]} />
          ))}
        </group>
      </group>
      {/* gantry */}
      <mesh geometry={geo.box} material={mat.mid} position={[-3.9, 1.9, -2.2]} scale={[0.1, 3.8, 0.1]} />
      <mesh geometry={geo.box} material={mat.mid} position={[3.9, 1.9, -2.2]} scale={[0.1, 3.8, 0.1]} />
      <mesh geometry={geo.box} material={mat.mid} position={[0, 3.8, -2.2]} scale={[8, 0.1, 0.1]} />
      {/* data streams */}
      <points ref={stream} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[streamPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={palette.signal} size={0.09} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      {tier !== "low" && <pointLight ref={light} position={[0, 3.2, 1.6]} color={palette.accent} intensity={2} distance={11} decay={2} />}
    </Zone>
  );
}
