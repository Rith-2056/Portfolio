import * as THREE from "three";

/** Restrained palette shared across the 3D world. */
export const palette = {
  ink: "#0a0a0b",
  ground: "#16181c",
  groundEdge: "#1f2126",
  rock: "#0e0f11",
  dark: "#1a1c20",
  dark2: "#24272d",
  mid: "#31353c",
  light: "#d9d6cf",
  bone: "#e8e6e1",
  accent: "#ff6a1f",
  accentDim: "#8a3a10",
  signal: "#5fe0c8",
  signalDim: "#2a6c62",
} as const;

const std = (opts: THREE.MeshStandardMaterialParameters) =>
  new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.1, ...opts });

export const mat = {
  ground: std({ color: palette.ground, flatShading: true, roughness: 0.95 }),
  groundEdge: std({ color: palette.groundEdge, flatShading: true }),
  rock: std({ color: palette.rock, flatShading: true, roughness: 1 }),
  dark: std({ color: palette.dark, flatShading: true }),
  dark2: std({ color: palette.dark2, flatShading: true }),
  mid: std({ color: palette.mid, flatShading: true, metalness: 0.25, roughness: 0.6 }),
  light: std({ color: palette.light, flatShading: true, roughness: 0.55, metalness: 0.05 }),
  bone: std({ color: palette.bone, roughness: 0.5 }),
  accent: std({ color: palette.accent, emissive: palette.accent, emissiveIntensity: 0.9, roughness: 0.4 }),
  accentSoft: std({ color: palette.accentDim, emissive: palette.accent, emissiveIntensity: 0.25, roughness: 0.6 }),
  signal: std({ color: palette.signal, emissive: palette.signal, emissiveIntensity: 0.9, roughness: 0.4 }),
  signalSoft: std({ color: palette.signalDim, emissive: palette.signal, emissiveIntensity: 0.3 }),
  glass: new THREE.MeshStandardMaterial({
    color: "#0f1114",
    roughness: 0.2,
    metalness: 0.6,
    transparent: true,
    opacity: 0.9,
  }),
  holo: new THREE.MeshBasicMaterial({
    color: palette.signal,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
  holoAccent: new THREE.MeshBasicMaterial({
    color: palette.accent,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
  wire: new THREE.MeshBasicMaterial({ color: palette.mid, wireframe: true, transparent: true, opacity: 0.6 }),
  wireSignal: new THREE.MeshBasicMaterial({ color: palette.signal, wireframe: true, transparent: true, opacity: 0.35 }),
  lineDark: new THREE.LineBasicMaterial({ color: palette.mid, transparent: true, opacity: 0.7 }),
  lineSignal: new THREE.LineBasicMaterial({ color: palette.signal, transparent: true, opacity: 0.35 }),
};

export const geo = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 12, 8),
  sphereLow: new THREE.SphereGeometry(1, 8, 6),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
  cylLow: new THREE.CylinderGeometry(1, 1, 1, 6),
  ico: new THREE.IcosahedronGeometry(1, 0),
  dodeca: new THREE.DodecahedronGeometry(1, 0),
  ring: new THREE.RingGeometry(0.8, 1, 48),
  torus: new THREE.TorusGeometry(1, 0.04, 8, 48),
  plane: new THREE.PlaneGeometry(1, 1),
};
