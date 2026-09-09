"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/lib/store";
import { damp, dampAngle } from "@/lib/physics";
import { zoneById } from "@/data/zones";
import { roverState, cameraInput } from "./roverState";

const PITCH_EXPLORE = 0.62;
const PITCH_SECTION = 0.42;

export function CameraRig() {
  const { camera, gl } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.6, 6));
  const lookAt = useRef(new THREE.Vector3(0, 0.6, 6));
  const pos = useRef(new THREE.Vector3(0, 34, 62));
  const distance = useRef(60);
  const pitch = useRef(0.5);
  const yaw = useRef(0.35);
  const introT = useRef(0);
  const transitionT = useRef(0);
  const lastPhase = useRef(useStore.getState().phase);
  const reduced = useStore((s) => s.reducedMotion);

  useEffect(() => {
    camera.position.copy(pos.current);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // pointer orbit + zoom
  useEffect(() => {
    const el = gl.domElement;
    let startX = 0;
    let startYaw = 0;
    let moved = 0;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      cameraInput.dragging = true;
      startX = e.clientX;
      startYaw = cameraInput.targetYaw;
      moved = 0;
    };
    const move = (e: PointerEvent) => {
      cameraInput.px = (e.clientX / window.innerWidth) * 2 - 1;
      cameraInput.py = (e.clientY / window.innerHeight) * 2 - 1;
      if (!cameraInput.dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      cameraInput.targetYaw = startYaw - dx * 0.006;
    };
    const up = () => {
      cameraInput.dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      if (useStore.getState().phase !== "explore") return;
      cameraInput.targetDistance = THREE.MathUtils.clamp(cameraInput.targetDistance + e.deltaY * 0.012, 9, 28);
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [gl]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 15);
    const s = useStore.getState();
    const phase = s.phase;

    if (phase !== lastPhase.current) {
      transitionT.current = 0;
      lastPhase.current = phase;
    }
    transitionT.current += dt;

    let desiredDistance = cameraInput.targetDistance;
    let desiredPitch = PITCH_EXPLORE;
    let desiredYaw = cameraInput.targetYaw;
    const tgt = target.current;
    const look = lookAt.current;

    if (phase === "loading" || phase === "intro") {
      // slow reveal: orbit far above the island, descending gently
      introT.current += dt;
      const t = introT.current;
      const k = Math.min(1, t / 9);
      desiredDistance = reduced ? 46 : 58 - k * 12;
      desiredPitch = reduced ? 0.5 : 0.62 - k * 0.14;
      desiredYaw = reduced ? 0.35 : 0.9 - t * 0.045;
      cameraInput.targetYaw = desiredYaw;
      cameraInput.yaw = desiredYaw;
      tgt.set(0, 0.5, 2);
    } else if (phase === "section" && s.activeSection) {
      const z = zoneById[s.activeSection];
      tgt.set(z.focus[0], z.focus[1], z.focus[2]);
      desiredDistance = 10.5;
      desiredPitch = PITCH_SECTION;
      // look at the zone from the island's center side so it sits against the sky
      const inward = Math.atan2(-z.position[0], -z.position[1]);
      const isHub = z.id === "about";
      desiredYaw = isHub ? cameraInput.targetYaw : inward + Math.PI + 0.55;
      cameraInput.targetYaw = desiredYaw;
    } else {
      tgt.set(roverState.x, 0.6, roverState.z);
      // lead the camera slightly in the direction of travel
      tgt.x += roverState.vx * 0.12;
      tgt.z += roverState.vz * 0.12;
    }

    // the moment we leave the intro, ease in more slowly for a cinematic hand-off
    const settling = transitionT.current < 2.2;
    const lam = settling ? 1.6 : 4.5;

    distance.current = damp(distance.current, desiredDistance, lam, dt);
    pitch.current = damp(pitch.current, desiredPitch, lam, dt);
    yaw.current = dampAngle(yaw.current, desiredYaw, cameraInput.dragging ? 12 : lam, dt);
    cameraInput.yaw = yaw.current;
    cameraInput.distance = distance.current;

    look.x = damp(look.x, tgt.x, lam + 1, dt);
    look.y = damp(look.y, tgt.y, lam + 1, dt);
    look.z = damp(look.z, tgt.z, lam + 1, dt);

    const d = distance.current;
    const p = pitch.current;
    const y = yaw.current;
    const parallax = reduced || cameraInput.dragging ? 0 : 1;
    const ox = look.x + Math.sin(y) * d * Math.cos(p) + cameraInput.px * 0.6 * parallax;
    const oy = look.y + Math.sin(p) * d - cameraInput.py * 0.4 * parallax;
    const oz = look.z + Math.cos(y) * d * Math.cos(p);

    pos.current.set(
      damp(camera.position.x, ox, lam + 1.5, dt),
      damp(camera.position.y, oy, lam + 1.5, dt),
      damp(camera.position.z, oz, lam + 1.5, dt),
    );
    camera.position.copy(pos.current);
    camera.lookAt(look);
  });

  return null;
}
