"use client";

import { create } from "zustand";
import type { ZoneId } from "@/data/zones";

export type Phase = "loading" | "intro" | "explore" | "section";
export type PerfTier = "high" | "medium" | "low";

type State = {
  phase: Phase;
  activeSection: ZoneId | null;
  nearZone: ZoneId | null;
  hoveredZone: ZoneId | null;
  /** zone the rover should be moved to on the next frame (set by nav) */
  teleportTo: ZoneId | null;
  /** id of the zone that was most recently visited */
  visited: ZoneId[];
  perfTier: PerfTier;
  reducedMotion: boolean;
  roverX: number;
  roverZ: number;
  roverSpeed: number;
  ready: boolean;
  worldLoaded: boolean;
  /** index of the accomplishment currently hovered in the experience panel */
  highlight: number | null;

  setPhase: (p: Phase) => void;
  setReady: (v: boolean) => void;
  setWorldLoaded: (v: boolean) => void;
  setHighlight: (i: number | null) => void;
  setPerf: (tier: PerfTier, reducedMotion: boolean) => void;
  setNearZone: (z: ZoneId | null) => void;
  setHoveredZone: (z: ZoneId | null) => void;
  setRover: (x: number, z: number, speed: number) => void;
  openSection: (id: ZoneId, opts?: { teleport?: boolean }) => void;
  closeSection: () => void;
  consumeTeleport: () => void;
  enterWorld: () => void;
};

export const useStore = create<State>((set, get) => ({
  phase: "loading",
  activeSection: null,
  nearZone: null,
  hoveredZone: null,
  teleportTo: null,
  visited: [],
  perfTier: "high",
  reducedMotion: false,
  roverX: 0,
  roverZ: 6,
  roverSpeed: 0,
  ready: false,
  worldLoaded: false,
  highlight: null,

  setPhase: (phase) => set({ phase }),
  setReady: (ready) => set({ ready }),
  setWorldLoaded: (worldLoaded) => set({ worldLoaded }),
  setHighlight: (highlight) => {
    if (get().highlight !== highlight) set({ highlight });
  },
  setPerf: (perfTier, reducedMotion) => set({ perfTier, reducedMotion }),
  setNearZone: (nearZone) => {
    if (get().nearZone !== nearZone) set({ nearZone });
  },
  setHoveredZone: (hoveredZone) => {
    if (get().hoveredZone !== hoveredZone) set({ hoveredZone });
  },
  setRover: (roverX, roverZ, roverSpeed) => set({ roverX, roverZ, roverSpeed }),
  openSection: (id, opts) => {
    const visited = get().visited.includes(id) ? get().visited : [...get().visited, id];
    set({
      activeSection: id,
      phase: "section",
      visited,
      teleportTo: opts?.teleport ? id : null,
      hoveredZone: null,
    });
  },
  closeSection: () => set({ activeSection: null, phase: "explore", highlight: null }),
  consumeTeleport: () => set({ teleportTo: null }),
  enterWorld: () => set({ phase: "explore" }),
}));
