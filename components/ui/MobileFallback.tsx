"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import { zones, type ZoneId } from "@/data/zones";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Panel } from "./Panel";

/** A 2D island map: the same locations, tappable, with the same content panels. */
export function MobileFallback() {
  const openSection = useStore((s) => s.openSection);
  const active = useStore((s) => s.activeSection);
  const visited = useStore((s) => s.visited);
  const setPhase = useStore((s) => s.setPhase);

  useEffect(() => {
    setPhase("explore");
    document.body.dataset.scroll = "true";
    return () => {
      delete document.body.dataset.scroll;
    };
  }, [setPhase]);

  const S = 360;
  const scale = 6.4;
  const toXY = (x: number, z: number) => [S / 2 + x * scale, S / 2 + z * scale] as const;

  return (
    <main className="relative min-h-dvh bg-ink grid-bg">
      <div className="mx-auto max-w-lg px-5 pb-20 pt-8">
        <header className="flex items-start justify-between font-mono text-[10px] tracking-[0.22em] text-bone-3">
          <div>
            <div className="text-bone">RITH.OS</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal blink" />
              MAP MODE
            </div>
          </div>
          <div className="text-right">
            <div>42.39°N</div>
            <div>72.53°W</div>
          </div>
        </header>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mt-10">
          <h1 className="font-display text-[2.6rem] font-semibold leading-[0.95] tracking-[-0.02em] text-bone">
            DIVYARITH
            <br />
            SHIVASHOK
          </h1>
          <p className="mt-4 font-mono text-[11px] tracking-[0.18em] text-bone-2 uppercase">{profile.title}</p>
          <p className="mt-4 text-[16px] leading-relaxed text-bone-2">{profile.tagline}</p>
        </motion.div>

        {/* map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="corners relative mt-10 border border-line bg-ink-2/60"
        >
          <div className="flex items-center justify-between px-3 py-2 font-mono text-[9px] tracking-[0.2em] text-bone-3">
            <span>ISLAND OVERVIEW</span>
            <span>TAP A LOCATION</span>
          </div>
          <svg viewBox={`0 0 ${S} ${S}`} className="block w-full" role="group" aria-label="Island map">
            <defs>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#5fe0c8" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#5fe0c8" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* island */}
            <polygon
              points={Array.from({ length: 14 }, (_, i) => {
                const a = (i / 14) * Math.PI * 2;
                return `${S / 2 + Math.cos(a) * 158},${S / 2 + Math.sin(a) * 158}`;
              }).join(" ")}
              fill="#131417"
              stroke="#ff6a1f"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
            {/* grid */}
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i} stroke="#ffffff" strokeOpacity="0.05">
                <line x1={20 + i * 40} y1={20} x2={20 + i * 40} y2={S - 20} />
                <line x1={20} y1={20 + i * 40} x2={S - 20} y2={20 + i * 40} />
              </g>
            ))}
            {/* paths */}
            {zones
              .filter((z) => z.id !== "about")
              .map((z) => {
                const [x, y] = toXY(z.position[0], z.position[1]);
                return <line key={z.id} x1={S / 2} y1={S / 2} x2={x} y2={y} stroke="#2b2e34" strokeWidth="3" strokeLinecap="round" />;
              })}
            {/* orbiting rover marker */}
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${S / 2} ${S / 2}`} to={`360 ${S / 2} ${S / 2}`} dur="26s" repeatCount="indefinite" />
              <circle cx={S / 2} cy={S / 2 + 8 * scale} r="14" fill="url(#glow)" />
              <circle cx={S / 2} cy={S / 2 + 8 * scale} r="2.5" fill="#5fe0c8" />
            </g>
            {/* zones */}
            {zones.map((z, i) => {
              const [x, y] = toXY(z.position[0], z.position[1]);
              const seen = visited.includes(z.id);
              return (
                <g key={z.id} onClick={() => openSection(z.id)} role="button" tabIndex={0} aria-label={z.description} style={{ cursor: "pointer" }}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openSection(z.id)}>
                  <circle cx={x} cy={y} r="8" fill="none" stroke={seen ? "#5fe0c8" : "#ff6a1f"} strokeOpacity="0.5">
                    <animate attributeName="r" values="8;22" dur="1.8s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.5;0" dur="1.8s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="16" fill="#0a0a0b" fillOpacity="0.01" />
                  <rect x={x - 5} y={y - 5} width="10" height="10" fill={seen ? "#5fe0c8" : "#e8e6e1"} transform={`rotate(45 ${x} ${y})`} />
                  <text x={x} y={y + (z.position[1] < 0 ? -14 : 22)} textAnchor="middle" fill="#a9a7a1" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="1.5">
                    {z.description.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* list */}
        <nav aria-label="Sections" className="mt-8 divide-y divide-line border-y border-line">
          {zones.map((z, i) => {
            const seen = visited.includes(z.id);
            return (
              <button
                key={z.id}
                onClick={() => openSection(z.id)}
                className="flex w-full items-center justify-between py-3.5 text-left"
              >
                <span className="flex items-center gap-4">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-bone-3">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[17px] font-medium text-bone">{z.description}</span>
                </span>
                <span className="flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-bone-3">
                  <span className={cn(seen ? "text-signal" : "")}>{seen ? "SEEN" : z.code}</span>
                  <span>→</span>
                </span>
              </button>
            );
          })}
        </nav>

        <p className="mt-10 font-mono text-[10px] leading-relaxed tracking-[0.12em] text-bone-3">
          THE FULL 3D WORLD RUNS ON DESKTOP. THIS MAP CARRIES THE SAME CONTENT.
        </p>
      </div>

      <Panel blur={false} />
      <span className="sr-only">{active ? "Section open" : ""}</span>
    </main>
  );
}
