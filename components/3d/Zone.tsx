"use client";

import { useRef, useCallback, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/lib/store";
import { palette } from "@/lib/materials";
import { damp } from "@/lib/physics";
import type { Zone as ZoneData } from "@/data/zones";
import { roverState } from "./roverState";

type Props = {
  zone: ZoneData;
  children: ReactNode;
  /** vertical position of the floating label */
  labelHeight?: number;
  /** radius of the ground marker ring */
  markerRadius?: number;
};

let dragStart = { x: 0, y: 0 };

/**
 * Interactive wrapper for a location on the island: hover highlight, click to open,
 * a pulsing ground marker and a floating terminal-style label.
 */
export function Zone({ zone, children, labelHeight = 3.4, markerRadius }: Props) {
  const group = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const near = useStore((s) => s.nearZone === zone.id);
  const hovered = useStore((s) => s.hoveredZone === zone.id);
  const visited = useStore((s) => s.visited.includes(zone.id));
  const phase = useStore((s) => s.phase);
  const r = markerRadius ?? Math.max(zone.colliderRadius + 0.9, 2);

  const onOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (useStore.getState().phase !== "explore") return;
      useStore.getState().setHoveredZone(zone.id);
      document.documentElement.dataset.cursor = "interactive";
    },
    [zone.id],
  );
  const onOut = useCallback(() => {
    const s = useStore.getState();
    if (s.hoveredZone === zone.id) s.setHoveredZone(null);
    if (document.documentElement.dataset.cursor === "interactive") delete document.documentElement.dataset.cursor;
  }, [zone.id]);
  const onDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    dragStart = { x: e.clientX, y: e.clientY };
  }, []);
  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const s = useStore.getState();
      if (s.phase !== "explore") return;
      // ignore clicks that were really camera drags
      if (Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) > 6) return;
      const d = Math.hypot(roverState.x - zone.position[0], roverState.z - zone.position[1]);
      s.openSection(zone.id, { teleport: d > zone.triggerRadius });
      delete document.documentElement.dataset.cursor;
    },
    [zone],
  );

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const g = group.current;
    if (g) {
      const target = hovered ? 1.035 : 1;
      const k = damp(g.scale.x, target, 8, dt);
      g.scale.setScalar(k);
    }
    if (marker.current) {
      const m = marker.current.material as THREE.MeshBasicMaterial;
      const base = near ? 0.55 : hovered ? 0.4 : 0.14;
      m.opacity = damp(m.opacity, base + Math.sin(t * 2.2) * 0.05, 6, dt);
      m.color.set(near || hovered ? palette.accent : visited ? palette.signal : palette.bone);
    }
    if (pulse.current) {
      const p = ((t * 0.5 + zone.position[0] * 0.13) % 1 + 1) % 1;
      pulse.current.scale.setScalar(1 + p * 0.6);
      const m = pulse.current.material as THREE.MeshBasicMaterial;
      m.opacity = (near ? 0.28 : 0.1) * (1 - p);
      pulse.current.visible = phase === "explore" || phase === "section";
    }
  });

  return (
    <group position={[zone.position[0], 0, zone.position[1]]}>
      <group
        ref={group}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onPointerDown={onDown}
        onClick={onClick}
      >
        {children}
      </group>
      {/* ground marker */}
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[r - 0.06, r, 64]} />
        <meshBasicMaterial color={palette.bone} transparent opacity={0.14} depthWrite={false} />
      </mesh>
      <mesh ref={pulse} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[r - 0.04, r, 64]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.1} depthWrite={false} />
      </mesh>
      {/* floating label */}
      {phase !== "loading" && (
        <Html
          position={[0, labelHeight, 0]}
          center
          zIndexRange={[5, 0]}
          style={{ pointerEvents: "none", userSelect: "none" }}
          distanceFactor={13}
        >
          <div
            className="flex flex-col items-center gap-1 transition-opacity duration-300"
            style={{ opacity: phase === "section" ? 0 : near || hovered ? 1 : 0.7 }}
          >
            <div
              className="whitespace-nowrap font-mono text-[11px] tracking-[0.22em]"
              style={{ color: near || hovered ? palette.accent : "#a9a7a1" }}
            >
              {zone.code}
            </div>
            <div className="whitespace-nowrap font-mono text-[13px] tracking-[0.12em] text-bone">
              {zone.label.toUpperCase()}
            </div>
            <div className="h-5 w-px bg-line-2" />
          </div>
        </Html>
      )}
    </group>
  );
}
