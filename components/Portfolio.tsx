"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";
import { useStore } from "@/lib/store";
import { useKeyboard } from "@/lib/input";
import { detectPerfTier, isMobileDevice, prefersReducedMotion, supportsWebGL } from "@/lib/device";
import { Loader } from "./ui/Loader";
import { Intro } from "./ui/Intro";
import { HUD } from "./ui/HUD";
import { InteractPrompt } from "./ui/InteractPrompt";
import { Panel } from "./ui/Panel";
import { Cursor } from "./ui/Cursor";
import { Scanlines } from "./ui/Scanlines";
import { Joystick } from "./ui/Joystick";
import { MobileFallback } from "./ui/MobileFallback";

const Experience = dynamic(() => import("./3d/Experience"), { ssr: false });

type Mode = "pending" | "3d" | "2d";

export function Portfolio() {
  const [mode, setMode] = useState<Mode>("pending");
  const [coarse, setCoarse] = useState(false);
  const phase = useStore((s) => s.phase);
  const worldLoaded = useStore((s) => s.worldLoaded);
  const setPerf = useStore((s) => s.setPerf);
  const setPhase = useStore((s) => s.setPhase);
  const enter = useStore((s) => s.enterWorld);
  const perfTier = useStore((s) => s.perfTier);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const mobile = isMobileDevice();
    const webgl = supportsWebGL();
    const tier = detectPerfTier();
    setPerf(tier, reduced);
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
    setMode(mobile || !webgl ? "2d" : "3d");
  }, [setPerf]);

  useKeyboard(mode === "3d" && phase === "explore");

  // once the world has rendered its first frames, hand over to the intro
  useEffect(() => {
    if (mode === "3d" && worldLoaded && phase === "loading") {
      const id = window.setTimeout(() => setPhase("intro"), 500);
      return () => window.clearTimeout(id);
    }
  }, [mode, worldLoaded, phase, setPhase]);

  // ENTER on the intro screen
  useEffect(() => {
    if (phase !== "intro") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") enter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, enter]);

  if (mode === "pending") {
    return <Loader done={false} />;
  }

  if (mode === "2d") {
    return (
      <MotionConfig reducedMotion="user">
        <MobileFallback />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <Experience />
      <Loader done={worldLoaded} />
      <Intro />
      <HUD coarse={coarse} />
      <InteractPrompt coarse={coarse} />
      {coarse && <Joystick />}
      <Panel blur={perfTier === "high"} />
      <Scanlines />
      <Cursor />
    </MotionConfig>
  );
}
