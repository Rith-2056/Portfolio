"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat, geo, palette } from "@/lib/materials";
import { keys, stick } from "@/lib/input";
import { resolveCollisions, damp, type Body } from "@/lib/physics";
import { useStore } from "@/lib/store";
import { zones, zoneById } from "@/data/zones";
import { roverState } from "./roverState";

const ACCEL = 22;
const MAX_SPEED = 9;
const BOOST_SPEED = 14;
const TURN_RATE = 2.6;
const DRAG = 2.2;
const RADIUS = 0.75;

export function Rover() {
  const group = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const thrustL = useRef<THREE.Mesh>(null);
  const thrustR = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const tier = useStore((s) => s.perfTier);

  const body = useMemo<Body>(() => ({ x: roverState.x, z: roverState.z, vx: 0, vz: 0 }), []);
  const state = useRef({ heading: roverState.heading, pitch: 0, roll: 0, lastSync: 0, turn: 0 });

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 15);
    const s = useStore.getState();
    const st = state.current;
    const t = clock.elapsedTime;

    // nav teleport request
    if (s.teleportTo) {
      const z = zoneById[s.teleportTo];
      body.x = z.spawn[0];
      body.z = z.spawn[1];
      body.vx = body.vz = 0;
      st.heading = Math.atan2(z.position[0] - body.x, z.position[1] - body.z);
      s.consumeTeleport();
    }

    const controllable = s.phase === "explore";

    // input
    let throttle = 0;
    let steer = 0;
    if (controllable) {
      throttle = (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0);
      steer = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
      if (stick.active) {
        throttle = -stick.y;
        steer = -stick.x;
      }
    }

    const speed = Math.hypot(body.vx, body.vz);
    const maxSpeed = keys.boost ? BOOST_SPEED : MAX_SPEED;

    // steering: car-like, turn rate scales with how fast we move (min so we can pivot in place a bit)
    const turnScale = 0.45 + Math.min(1, speed / 6) * 0.55;
    const reverse = throttle < 0 ? -1 : 1;
    const turn = steer * TURN_RATE * turnScale * reverse;
    st.heading += turn * dt;
    st.turn = damp(st.turn, turn, 8, dt);

    // thrust along heading
    const fx = Math.sin(st.heading);
    const fz = Math.cos(st.heading);
    body.vx += fx * throttle * ACCEL * dt;
    body.vz += fz * throttle * ACCEL * dt;

    // drag
    const dragK = Math.exp(-DRAG * dt);
    body.vx *= dragK;
    body.vz *= dragK;

    // clamp
    const sp = Math.hypot(body.vx, body.vz);
    if (sp > maxSpeed) {
      body.vx = (body.vx / sp) * maxSpeed;
      body.vz = (body.vz / sp) * maxSpeed;
    }

    body.x += body.vx * dt;
    body.z += body.vz * dt;
    resolveCollisions(body, RADIUS);

    // shared state
    roverState.x = body.x;
    roverState.z = body.z;
    roverState.heading = st.heading;
    roverState.speed = Math.hypot(body.vx, body.vz);
    roverState.vx = body.vx;
    roverState.vz = body.vz;

    // proximity to zones
    if (controllable || s.phase === "section") {
      let near: (typeof zones)[number] | null = null;
      let best = Infinity;
      for (const z of zones) {
        const d = Math.hypot(body.x - z.position[0], body.z - z.position[1]);
        if (d < z.triggerRadius && d < best) {
          best = d;
          near = z;
        }
      }
      s.setNearZone(near ? near.id : null);
      if (controllable && keys.interactPressed && near) {
        s.openSection(near.id);
      }
    }
    keys.interactPressed = false;

    // throttle store sync for HUD coordinates
    if (t - st.lastSync > 0.12) {
      st.lastSync = t;
      s.setRover(body.x, body.z, roverState.speed);
    }

    // visuals
    const g = group.current;
    if (!g) return;
    const hover = 0.55 + Math.sin(t * 2.6) * 0.035;
    g.position.set(body.x, hover, body.z);
    g.rotation.y = st.heading;

    const forwardAccel = (body.vx * fx + body.vz * fz) / MAX_SPEED;
    st.pitch = damp(st.pitch, -forwardAccel * 0.14, 6, dt);
    st.roll = damp(st.roll, st.turn * 0.09 * Math.min(1, roverState.speed / 4), 6, dt);
    if (bodyRef.current) {
      bodyRef.current.rotation.x = st.pitch;
      bodyRef.current.rotation.z = st.roll;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
      const m = ringRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.7 + Math.min(1, roverState.speed / MAX_SPEED) * 1.2;
    }
    const thrust = 0.15 + Math.min(1, roverState.speed / MAX_SPEED) * 0.85;
    for (const r of [thrustL, thrustR]) {
      if (r.current) {
        r.current.scale.setScalar(thrust * (0.9 + Math.sin(t * 24 + (r === thrustL ? 0 : 1.7)) * 0.1));
      }
    }
    if (lightRef.current) lightRef.current.intensity = 2.2 + thrust * 2;
  });

  return (
    <group ref={group} position={[roverState.x, 0.55, roverState.z]}>
      <group ref={bodyRef}>
        {/* chassis */}
        <mesh geometry={geo.box} material={mat.light} scale={[1.05, 0.26, 1.55]} castShadow>
        </mesh>
        {/* upper hull */}
        <mesh geometry={geo.box} material={mat.light} position={[0, 0.22, -0.1]} scale={[0.78, 0.2, 1.05]} castShadow />
        {/* canopy */}
        <mesh geometry={geo.box} material={mat.glass} position={[0, 0.34, 0.12]} scale={[0.56, 0.16, 0.5]} />
        {/* nose stripe */}
        <mesh geometry={geo.box} material={mat.accent} position={[0, 0.14, 0.72]} scale={[0.5, 0.05, 0.12]} />
        {/* side pods */}
        <mesh geometry={geo.box} material={mat.dark2} position={[0.6, -0.02, -0.15]} scale={[0.22, 0.2, 0.9]} />
        <mesh geometry={geo.box} material={mat.dark2} position={[-0.6, -0.02, -0.15]} scale={[0.22, 0.2, 0.9]} />
        {/* antenna */}
        <mesh geometry={geo.cylLow} material={mat.mid} position={[-0.32, 0.5, -0.5]} scale={[0.02, 0.45, 0.02]} />
        <mesh geometry={geo.sphereLow} material={mat.signal} position={[-0.32, 0.74, -0.5]} scale={0.05} />
        {/* thrusters */}
        <mesh ref={thrustL} geometry={geo.sphereLow} material={mat.accent} position={[0.3, 0.02, -0.82]} scale={0.5}>
        </mesh>
        <mesh ref={thrustR} geometry={geo.sphereLow} material={mat.accent} position={[-0.3, 0.02, -0.82]} scale={0.5} />
        {/* headlight */}
        <mesh geometry={geo.box} material={mat.signal} position={[0, 0.05, 0.78]} scale={[0.3, 0.05, 0.04]} />
      </group>
      {/* hover ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]}>
        <ringGeometry args={[0.55, 0.72, 32]} />
        <meshStandardMaterial
          color={palette.signalDim}
          emissive={palette.signal}
          emissiveIntensity={0.8}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <circleGeometry args={[0.95, 24]} />
        <meshBasicMaterial color={palette.signal} transparent opacity={0.08} depthWrite={false} />
      </mesh>
      {tier !== "low" && (
        <pointLight ref={lightRef} position={[0, 0.4, 0]} color={palette.signal} intensity={2.5} distance={7} decay={2} />
      )}
    </group>
  );
}
