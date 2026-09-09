"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/lib/store";
import { World } from "./World";

/** The full 3D experience. Loaded dynamically so the initial HTML stays light. */
export default function Experience() {
  const tier = useStore((s) => s.perfTier);
  const dpr: [number, number] = tier === "high" ? [1, 1.75] : tier === "medium" ? [1, 1.25] : [0.75, 1];

  return (
    <Canvas
      dpr={dpr}
      shadows={tier === "high"}
      camera={{ fov: 38, near: 0.5, far: 220, position: [0, 34, 62] }}
      gl={{
        antialias: tier !== "low",
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#0a0a0b");
      }}
      className="!fixed inset-0"
      style={{ position: "fixed", inset: 0 }}
    >
      <color attach="background" args={["#0a0a0b"]} />
      <fog attach="fog" args={["#0a0a0b", 55, 130]} />
      <Suspense fallback={null}>
        <World />
      </Suspense>
    </Canvas>
  );
}
