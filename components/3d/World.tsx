"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { Island } from "./Island";
import { Batmobile } from "./Batmobile";
import { CameraRig } from "./CameraRig";
import { Particles, Clouds } from "./Ambient";
import { Hub } from "./zones/Hub";
import { DataCenter } from "./zones/DataCenter";
import { RoboticsLab } from "./zones/RoboticsLab";
import { Workshop } from "./zones/Workshop";
import { Constellation } from "./zones/Constellation";
import { Academy } from "./zones/Academy";
import { CommsTower } from "./zones/CommsTower";

function Loaded() {
  const setWorldLoaded = useStore((s) => s.setWorldLoaded);
  useEffect(() => {
    // give the first frame a beat to compile shaders before declaring ready
    const id = window.setTimeout(() => setWorldLoaded(true), 250);
    return () => window.clearTimeout(id);
  }, [setWorldLoaded]);
  return null;
}

export function World() {
  const tier = useStore((s) => s.perfTier);
  const high = tier === "high";
  return (
    <>
      <ambientLight intensity={0.55} color="#b9c2d0" />
      <hemisphereLight args={["#4c515c", "#0a0a0b", 0.85]} />
      <directionalLight
        position={[18, 28, 12]}
        intensity={2.0}
        color="#ffe9d6"
        castShadow={high}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-20, 12, -16]} intensity={0.42} color="#82b4c6" />

      <Island />
      <Hub />
      <DataCenter />
      <RoboticsLab />
      <Workshop />
      <Constellation />
      <Academy />
      <CommsTower />
      <Batmobile />
      <CameraRig />

      {tier !== "low" && <Particles count={high ? 320 : 140} />}
      {tier !== "low" && <Clouds count={high ? 7 : 4} />}
      <Loaded />
    </>
  );
}
