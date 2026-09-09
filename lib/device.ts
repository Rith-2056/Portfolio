"use client";

import type { PerfTier } from "./store";

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function isMobileDevice() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry/i.test(ua);
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const narrow = window.innerWidth < 820;
  return (uaMobile && coarse) || (coarse && narrow) || narrow;
}

/** Cheap heuristic performance tier, no benchmark needed. */
export function detectPerfTier(): PerfTier {
  if (typeof window === "undefined") return "high";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 8;
  let score = 0;
  if (cores >= 8) score += 2;
  else if (cores >= 4) score += 1;
  if (mem >= 8) score += 2;
  else if (mem >= 4) score += 1;
  if (window.devicePixelRatio > 2) score -= 1;

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return "low";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)).toLowerCase()
      : "";
    if (/swiftshader|llvmpipe|software/.test(renderer)) return "low";
    if (/intel/.test(renderer) && !/iris|arc/.test(renderer)) score -= 1;
    if (/nvidia|radeon|apple|geforce|rtx|m1|m2|m3|m4/.test(renderer)) score += 1;
    const loseCtx = gl.getExtension("WEBGL_lose_context");
    loseCtx?.loseContext();
  } catch {
    // ignore
  }

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

export function supportsWebGL() {
  if (typeof window === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
