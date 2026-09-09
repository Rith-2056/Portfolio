"use client";

import { useEffect, useRef } from "react";
import { stick } from "@/lib/input";
import { useStore } from "@/lib/store";

/** On-screen joystick for touch devices that still get the 3D world (tablets). */
export function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const phase = useStore((s) => s.phase);

  useEffect(() => {
    const el = base.current;
    if (!el) return;
    let id: number | null = null;
    const R = 44;
    const set = (dx: number, dz: number) => {
      const len = Math.hypot(dx, dz);
      const k = len > R ? R / len : 1;
      dx *= k;
      dz *= k;
      stick.x = dx / R;
      stick.y = dz / R;
      if (knob.current) knob.current.style.transform = `translate(${dx}px, ${dz}px)`;
    };
    const down = (e: PointerEvent) => {
      id = e.pointerId;
      el.setPointerCapture(id);
      stick.active = true;
      const r = el.getBoundingClientRect();
      set(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const r = el.getBoundingClientRect();
      set(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      stick.active = false;
      set(0, 0);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div
      ref={base}
      className="fixed bottom-8 left-1/2 z-[36] flex h-32 w-32 -translate-x-1/2 touch-none items-center justify-center rounded-full border border-line-2 bg-ink/50 transition-opacity"
      style={{ opacity: phase === "explore" ? 1 : 0, pointerEvents: phase === "explore" ? "auto" : "none" }}
      aria-label="Movement joystick"
      role="application"
    >
      <div ref={knob} className="h-12 w-12 rounded-full border border-accent/60 bg-ink/80" />
    </div>
  );
}
