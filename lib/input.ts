"use client";

import { useEffect } from "react";

/** Live keyboard state, read inside the render loop without re-rendering React. */
export const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  boost: false,
  /** set to true for exactly one frame when the interact key is pressed */
  interactPressed: false,
};

const map: Record<string, keyof typeof keys | undefined> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "boost",
  ShiftRight: "boost",
};

let listeners = 0;

function isTypingTarget(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function useKeyboard(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const down = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const k = map[e.code];
      if (k) {
        keys[k] = true;
        if (e.code.startsWith("Arrow")) e.preventDefault();
      }
      if (e.code === "KeyE" || e.code === "Enter" || e.code === "Space") {
        if (!e.repeat) keys.interactPressed = true;
        if (e.code === "Space") e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = map[e.code];
      if (k) keys[k] = false;
    };
    const blur = () => {
      keys.forward = keys.backward = keys.left = keys.right = keys.boost = false;
    };
    listeners++;
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      listeners--;
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      blur();
    };
  }, [enabled]);
}

/** Touch / on-screen joystick state, normalised to [-1, 1]. */
export const stick = { x: 0, y: 0, active: false };
