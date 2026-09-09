"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import { mat, geo, palette } from "@/lib/materials";
import { loftHull, shoulderRibbon, radialGlowTexture, type Station } from "./carGeometry";
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
const RADIUS = 0.9;

const RIDE_HEIGHT = 0.55;
const REAR_WHEEL_R = 0.4;
const FRONT_WHEEL_R = 0.34;

/**
 * Cross-sections of the hull from the nose back to the tail: a pointed wedge
 * nose, a waisted cockpit, flared rear haunches and a tapered tail where the
 * turbine sits.
 */
const STATIONS: Station[] = [
  { z: 1.52, wb: 0.2, wm: 0.25, wt: 0.16, yb: -0.13, ym: -0.06, yt: -0.01 },
  { z: 1.24, wb: 0.44, wm: 0.54, wt: 0.38, yb: -0.18, ym: -0.03, yt: 0.06 },
  { z: 0.8, wb: 0.56, wm: 0.72, wt: 0.52, yb: -0.2, ym: -0.01, yt: 0.12 },
  { z: 0.32, wb: 0.54, wm: 0.64, wt: 0.5, yb: -0.2, ym: 0.02, yt: 0.16 },
  { z: -0.02, wb: 0.55, wm: 0.66, wt: 0.42, yb: -0.2, ym: 0.03, yt: 0.44 },
  { z: -0.48, wb: 0.56, wm: 0.68, wt: 0.4, yb: -0.2, ym: 0.04, yt: 0.46 },
  { z: -0.84, wb: 0.58, wm: 0.76, wt: 0.5, yb: -0.2, ym: 0.06, yt: 0.24 },
  { z: -1.18, wb: 0.54, wm: 0.72, wt: 0.48, yb: -0.19, ym: 0.05, yt: 0.2 },
  { z: -1.44, wb: 0.4, wm: 0.54, wt: 0.38, yb: -0.16, ym: 0.02, yt: 0.14 },
];

type WheelProps = { x: number; z: number; radius: number; width: number; spin: React.RefObject<THREE.Group | null> };

function Wheel({ x, z, radius, width, spin }: WheelProps) {
  return (
    <group position={[x, radius - 0.53, z]} rotation={[0, 0, Math.PI / 2]}>
      <group ref={spin}>
        <mesh geometry={geo.cyl} material={mat.tire} scale={[radius, width, radius]} castShadow>
          <Edges threshold={24} color="#4b5058" lineWidth={1} />
        </mesh>
        {/* rim faces, one per side, so the wheel reads as it turns */}
        <mesh geometry={geo.cylLow} material={mat.rim} position={[0, width / 2 + 0.005, 0]} scale={[radius * 0.55, 0.02, radius * 0.55]} />
        <mesh geometry={geo.cylLow} material={mat.rim} position={[0, -width / 2 - 0.005, 0]} scale={[radius * 0.55, 0.02, radius * 0.55]} />
        {/* spokes make the rotation legible */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            geometry={geo.box}
            material={mat.carPanel}
            position={[0, width / 2 + 0.01, 0]}
            rotation={[0, (i / 3) * Math.PI, 0]}
            scale={[radius * 1.05, 0.02, 0.05]}
          />
        ))}
      </group>
    </group>
  );
}

/**
 * The player vehicle: a low-poly Batmobile with an exposed rear turbine.
 * The body is near-black, so readability comes from edge outlines, side light
 * strips, headlights and the turbine glow rather than from the paint.
 */
export function Batmobile() {
  const group = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  const flameCore = useRef<THREE.Mesh>(null);
  const turbine = useRef<THREE.Mesh>(null);
  const fan = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const stripes = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const frontL = useRef<THREE.Group>(null);
  const frontR = useRef<THREE.Group>(null);
  const rearL = useRef<THREE.Group>(null);
  const rearR = useRef<THREE.Group>(null);
  const tier = useStore((s) => s.perfTier);
  const shell = useMemo(() => loftHull(STATIONS), []);
  const ribbonR = useMemo(() => shoulderRibbon(STATIONS, 1), []);
  const ribbonL = useMemo(() => shoulderRibbon(STATIONS, -1), []);
  const glowMap = useMemo(() => radialGlowTexture(), []);
  useEffect(() => () => {
    shell.dispose();
    ribbonR.dispose();
    ribbonL.dispose();
    glowMap.dispose();
  }, [shell, ribbonR, ribbonL, glowMap]);

  const body = useMemo<Body>(() => ({ x: roverState.x, z: roverState.z, vx: 0, vz: 0 }), []);
  const state = useRef({ heading: roverState.heading, pitch: 0, roll: 0, lastSync: 0, turn: 0, thrust: 0 });

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

    // steering: car-like, turn rate scales with how fast we move
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

    // ---- visuals ----
    const g = group.current;
    if (!g) return;
    g.position.set(body.x, RIDE_HEIGHT + Math.sin(t * 2.2) * 0.012, body.z);
    g.rotation.y = st.heading;

    // body leans under acceleration and cornering; wheels stay planted
    const forwardAccel = (body.vx * fx + body.vz * fz) / MAX_SPEED;
    st.pitch = damp(st.pitch, -forwardAccel * 0.09, 6, dt);
    st.roll = damp(st.roll, st.turn * 0.1 * Math.min(1, roverState.speed / 4), 6, dt);
    if (shellRef.current) {
      shellRef.current.rotation.x = st.pitch;
      shellRef.current.rotation.z = st.roll;
    }
    if (wheelsRef.current) wheelsRef.current.rotation.z = st.roll * 0.25;

    // wheels roll with ground speed, front pair also steers
    const along = body.vx * fx + body.vz * fz;
    const rearSpin = (along / REAR_WHEEL_R) * dt;
    const frontSpin = (along / FRONT_WHEEL_R) * dt;
    if (rearL.current) rearL.current.rotation.y -= rearSpin;
    if (rearR.current) rearR.current.rotation.y -= rearSpin;
    if (frontL.current) frontL.current.rotation.y -= frontSpin;
    if (frontR.current) frontR.current.rotation.y -= frontSpin;

    // turbine, exhaust and light strips react to throttle
    const load = Math.min(1, roverState.speed / MAX_SPEED);
    st.thrust = damp(st.thrust, 0.2 + load * 0.8 + (throttle > 0 ? 0.15 : 0), 5, dt);
    const flicker = 0.88 + Math.sin(t * 26) * 0.08 + Math.sin(t * 41) * 0.04;
    if (fan.current) fan.current.rotation.z += dt * (6 + load * 40);
    if (turbine.current) {
      (turbine.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + st.thrust * 0.45;
      turbine.current.scale.setScalar(0.95 + st.thrust * 0.1);
    }
    if (flame.current) {
      flame.current.scale.set(1, st.thrust * 1.25 * flicker, 1);
      (flame.current.material as THREE.MeshBasicMaterial).opacity = 0.07 + st.thrust * 0.16;
    }
    if (flameCore.current) {
      flameCore.current.scale.set(0.5, st.thrust * 0.9 * flicker, 0.5);
    }
    if (stripes.current) stripes.current.emissiveIntensity = 1.6 + st.thrust * 2.2;
    if (glow.current) (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + st.thrust * 0.12;
    if (lightRef.current) lightRef.current.intensity = 3 + st.thrust * 4;
  });

  return (
    <group ref={group} position={[roverState.x, RIDE_HEIGHT, roverState.z]}>
      <group ref={shellRef}>
        {/* lofted hull: the outlines are what keep a near-black car readable */}
        <mesh geometry={shell} material={mat.carBody} castShadow receiveShadow>
          <Edges threshold={20} color="#8d94a1" lineWidth={1.5} />
        </mesh>

        {/* raked windscreen */}
        <mesh geometry={geo.box} material={mat.glassDark} position={[0, 0.3, 0.15]} rotation={[-0.88, 0, 0]} scale={[0.88, 0.44, 0.035]} />
        {/* open engine bay behind the cabin */}
        <mesh geometry={geo.box} material={mat.tire} position={[0, 0.35, -0.66]} rotation={[1.02, 0, 0]} scale={[0.9, 0.42, 0.04]} />
        <mesh geometry={geo.box} position={[0, 0.33, -0.7]} rotation={[1.02, 0, 0]} scale={[0.7, 0.3, 0.02]}>
          <meshBasicMaterial color={palette.accent} transparent opacity={0.35} toneMapped={false} depthWrite={false} />
        </mesh>
        {/* roof spine */}
        <mesh geometry={geo.box} material={mat.carTrim} position={[0, 0.47, -0.25]} scale={[0.46, 0.035, 0.7]} />

        {/* hood scoop */}
        <mesh geometry={geo.box} material={mat.carPanel} position={[0, 0.15, 0.6]} scale={[0.42, 0.07, 0.56]} />
        <mesh geometry={geo.box} material={mat.tire} position={[0, 0.2, 0.6]} scale={[0.32, 0.05, 0.46]} />

        {/* front splitter with a lit leading edge */}
        <mesh geometry={geo.box} material={mat.carPanel} position={[0, -0.21, 1.24]} scale={[1.12, 0.05, 0.42]} />
        <mesh geometry={geo.box} position={[0, -0.21, 1.44]} scale={[0.98, 0.04, 0.03]}>
          <meshStandardMaterial color={palette.accentDim} emissive={palette.accent} emissiveIntensity={2.4} toneMapped={false} />
        </mesh>

        {/* headlights */}
        {[0.33, -0.33].map((x) => (
          <mesh key={x} geometry={geo.box} position={[x, 0.02, 1.28]} rotation={[0, 0, 0]} scale={[0.26, 0.05, 0.04]}>
            <meshStandardMaterial color="#e6fbf6" emissive={palette.signal} emissiveIntensity={3.4} toneMapped={false} />
          </mesh>
        ))}

        {/* light strips tracing the widest line of the body */}
        <mesh geometry={ribbonR}>
          <meshStandardMaterial
            ref={stripes}
            color={palette.accentDim}
            emissive={palette.accent}
            emissiveIntensity={1.8}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <mesh geometry={ribbonL}>
          <meshStandardMaterial
            color={palette.accentDim}
            emissive={palette.accent}
            emissiveIntensity={1.8}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* buttress fins off the rear deck */}
        {[1, -1].map((k) => (
          <mesh
            key={k}
            geometry={geo.box}
            material={mat.carBody}
            position={[k * 0.5, 0.24, -1.04]}
            rotation={[0.3, 0, -k * 0.22]}
            scale={[0.05, 0.22, 0.4]}
          />
        ))}

        {/* swept bat-wing spoiler */}
        {[0.4, -0.4].map((x) => (
          <mesh key={x} geometry={geo.box} material={mat.carTrim} position={[x, 0.3, -1.16]} scale={[0.05, 0.2, 0.06]} />
        ))}
        <mesh geometry={geo.box} material={mat.carBody} position={[0, 0.41, -1.18]} rotation={[0.12, 0, 0]} scale={[0.96, 0.045, 0.3]} castShadow>
          <Edges threshold={20} color="#8d94a1" lineWidth={1.2} />
        </mesh>
        {[1, -1].map((k) => (
          <mesh
            key={k}
            geometry={geo.box}
            material={mat.carBody}
            position={[k * 0.66, 0.437, -1.2]}
            rotation={[0.12, -k * 0.1, -k * 0.18]}
            scale={[0.38, 0.04, 0.27]}
            castShadow
          >
            <Edges threshold={20} color="#8d94a1" lineWidth={1.1} />
          </mesh>
        ))}

        {/* tail lights */}
        {[0.34, -0.34].map((x) => (
          <mesh key={x} geometry={geo.box} position={[x, 0.1, -1.46]} scale={[0.22, 0.04, 0.03]}>
            <meshStandardMaterial color="#7a1c05" emissive={palette.accent} emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
        ))}

        {/* exposed turbine */}
        <group position={[0, 0.02, -1.52]}>
          <mesh material={mat.carPanel} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.4, 14, 1, true]} />
          </mesh>
          <mesh material={mat.carTrim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
            <torusGeometry args={[0.3, 0.038, 6, 16]} />
          </mesh>
          <group ref={fan} position={[0, 0, 0.04]}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} geometry={geo.box} material={mat.rim} rotation={[0, 0, (i / 4) * Math.PI]} scale={[0.54, 0.035, 0.04]} />
            ))}
          </group>
          {/* glowing throat */}
          <mesh ref={turbine} position={[0, 0, -0.16]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[0.27, 16]} />
            <meshBasicMaterial color={palette.accent} transparent opacity={0.7} toneMapped={false} depthWrite={false} />
          </mesh>
          {/* exhaust plume */}
          <mesh ref={flame} position={[0, 0, -0.48]} rotation={[Math.PI / 2, 0, 0]} material={mat.ember}>
            <coneGeometry args={[0.24, 0.85, 10, 1, true]} />
          </mesh>
          <mesh ref={flameCore} position={[0, 0, -0.36]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.24, 0.85, 10, 1, true]} />
            <meshBasicMaterial color="#ffb066" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>

        {/* side exhaust stacks */}
        {[0.62, -0.62].map((x) => (
          <mesh key={x} geometry={geo.cylLow} material={mat.carTrim} position={[x, -0.11, -1.2]} rotation={[Math.PI / 2, 0, 0]} scale={[0.06, 0.36, 0.06]} />
        ))}
      </group>

      {/* wheels stay level with the ground while the shell leans */}
      <group ref={wheelsRef}>
        <Wheel x={0.64} z={0.84} radius={FRONT_WHEEL_R} width={0.26} spin={frontR} />
        <Wheel x={-0.64} z={0.84} radius={FRONT_WHEEL_R} width={0.26} spin={frontL} />
        <Wheel x={0.76} z={-0.86} radius={REAR_WHEEL_R} width={0.36} spin={rearR} />
        <Wheel x={-0.76} z={-0.86} radius={REAR_WHEEL_R} width={0.36} spin={rearL} />
      </group>

      {/* underglow keeps the silhouette separated from the dark ground */}
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.53, -0.15]}>
        <planeGeometry args={[3.0, 4.2]} />
        <meshBasicMaterial map={glowMap} transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {tier !== "low" && (
        <pointLight ref={lightRef} position={[0, 0.2, -1.5]} color={palette.accent} intensity={3} distance={9} decay={2} />
      )}
      {tier === "high" && (
        <pointLight position={[0, 0.1, 1.5]} color={palette.signal} intensity={1.6} distance={6} decay={2} />
      )}
    </group>
  );
}
