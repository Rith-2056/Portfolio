"use client";

import { useEffect, useRef } from "react";

/** Minimal custom cursor: a dot plus a lagging ring that expands over interactive targets. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const html = document.documentElement;
    html.classList.add("custom-cursor");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let visible = false;
    let interactive = false;
    let down = false;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        if (dot.current) dot.current.style.opacity = "1";
        if (ring.current) ring.current.style.opacity = "1";
      }
      const t = e.target as HTMLElement | null;
      const hit = !!t?.closest?.("a, button, [data-interactive], input, textarea, select, [role=button]");
      interactive = hit || html.dataset.cursor === "interactive";
    };
    const leave = () => {
      visible = false;
      if (dot.current) dot.current.style.opacity = "0";
      if (ring.current) ring.current.style.opacity = "0";
    };
    const pdown = () => (down = true);
    const pup = () => (down = false);

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      const stateInteractive = interactive || html.dataset.cursor === "interactive";
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${down ? 0.6 : 1})`;
      if (ring.current) {
        const s = stateInteractive ? 1.9 : down ? 0.8 : 1;
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${s})`;
        ring.current.style.borderColor = stateInteractive ? "#ff6a1f" : "rgba(232,230,225,0.55)";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", pdown);
    window.addEventListener("pointerup", pup);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", pdown);
      window.removeEventListener("pointerup", pup);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-bone opacity-0 transition-opacity duration-300"
        style={{ willChange: "transform" }}
      />
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-7 w-7 rounded-full border opacity-0 transition-[opacity,border-color] duration-300"
        style={{ willChange: "transform", borderColor: "rgba(232,230,225,0.55)" }}
      />
    </>
  );
}
