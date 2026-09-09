"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skills, skillGroups, linkTargets, type Skill, type SkillGroup } from "@/data/skills";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const W = 960;
const H = 560;

const groupStyle: Record<SkillGroup, { color: string; center: [number, number]; radius: number }> = {
  Programming: { color: "#e8e6e1", center: [150, 140], radius: 92 },
  "AI / ML": { color: "#5fe0c8", center: [460, 130], radius: 90 },
  Frameworks: { color: "#ff6a1f", center: [150, 405], radius: 100 },
  "Cloud / Infrastructure": { color: "#b3b0a8", center: [470, 400], radius: 128 },
};

type Node = Skill & { x: number; y: number; color: string; idx: number };

const targetIds = Object.keys(linkTargets);
const targetPos = (id: string): [number, number] => {
  const i = targetIds.indexOf(id);
  return [800, 78 + i * 80];
};

export function SkillsSection() {
  const [hover, setHover] = useState<Node | null>(null);

  const nodes = useMemo<Node[]>(() => {
    const out: Node[] = [];
    for (const g of skillGroups) {
      const list = skills.filter((s) => s.group === g);
      const st = groupStyle[g];
      list.forEach((s, k) => {
        const n = list.length;
        const r = st.radius * Math.sqrt((k + 0.6) / n);
        const th = k * 2.399963 + skillGroups.indexOf(g) * 1.1;
        out.push({
          ...s,
          x: st.center[0] + Math.cos(th) * r,
          y: st.center[1] + Math.sin(th) * r * 0.85,
          color: st.color,
          idx: out.length,
        });
      });
    }
    return out;
  }, []);

  const edges = useMemo(() => {
    const e: [Node, Node][] = [];
    for (const g of skillGroups) {
      const list = nodes.filter((n) => n.group === g);
      for (const a of list) {
        const near = list
          .filter((b) => b !== a)
          .sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y))
          .slice(0, 2);
        for (const b of near) if (a.idx < b.idx || !e.some(([p, q]) => p === b && q === a)) e.push([a, b]);
      }
    }
    return e;
  }, [nodes]);

  return (
    <RevealGroup className="space-y-8">
      <Reveal>
        <div className="label mb-3">Technology constellation</div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-bone md:text-4xl">Skills</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-bone-2">
          Hover a node to see where it has been used. Lines connect a technology to the projects and roles it powered.
        </p>
      </Reveal>

      <Reveal>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {skillGroups.map((g) => (
            <div key={g} className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-bone-3 uppercase">
              <span className="inline-block h-2 w-2" style={{ background: groupStyle[g].color }} />
              {g}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="scroll-thin relative overflow-x-auto border border-line bg-ink-2/50 corners">
          <div className="relative min-w-[720px]">
            <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="group" aria-label="Technology constellation">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeOpacity="0.035" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={W} height={H} fill="url(#grid)" />

              {/* intra-group edges */}
              {edges.map(([a, b], i) => {
                const lit = hover && (hover === a || hover === b);
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={lit ? a.color : "#ffffff"}
                    strokeOpacity={lit ? 0.5 : 0.08}
                    strokeWidth={1}
                  />
                );
              })}

              {/* links to targets */}
              <AnimatePresence>
                {hover &&
                  hover.links.map((id) => {
                    const [tx, ty] = targetPos(id);
                    return (
                      <motion.line
                        key={`${hover.name}-${id}`}
                        x1={hover.x}
                        y1={hover.y}
                        x2={tx}
                        y2={ty}
                        stroke="#ff6a1f"
                        strokeWidth={1.2}
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.9 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                      />
                    );
                  })}
              </AnimatePresence>

              {/* targets column */}
              <line x1={770} y1={40} x2={770} y2={H - 40} stroke="#ffffff" strokeOpacity="0.08" />
              <text x={800} y={44} fill="#6f6e6a" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="2">
                LINKED TO
              </text>
              {targetIds.map((id) => {
                const [x, y] = targetPos(id);
                const t = linkTargets[id];
                const lit = hover?.links.includes(id);
                return (
                  <g key={id} opacity={hover && !lit ? 0.35 : 1} style={{ transition: "opacity .25s" }}>
                    <rect x={x - 4} y={y - 4} width={8} height={8} fill={lit ? "#ff6a1f" : "#0a0a0b"} stroke={lit ? "#ff6a1f" : "#6f6e6a"} strokeWidth="1" />
                    <text x={x + 14} y={y - 2} fill={lit ? "#e8e6e1" : "#a9a7a1"} fontSize="11" fontFamily="var(--font-mono)">
                      {t.short}
                    </text>
                    <text x={x + 14} y={y + 11} fill="#6f6e6a" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="1.5">
                      {t.type.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* nodes */}
              {nodes.map((n) => {
                const on = hover === n;
                const dim = hover && !on;
                return (
                  <g
                    key={n.name}
                    className="float-node"
                    style={{ animationDelay: `${(n.idx % 7) * -0.9}s`, cursor: "pointer", opacity: dim ? 0.45 : 1, transition: "opacity .25s" }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${n.name}, ${n.group}${n.links.length ? `, used in ${n.links.map((l) => linkTargets[l].label).join(", ")}` : ""}`}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(n)}
                    onBlur={() => setHover(null)}
                    data-interactive
                  >
                    <circle cx={n.x} cy={n.y} r={on ? 14 : 10} fill={n.color} fillOpacity={on ? 0.18 : 0.08} />
                    <circle cx={n.x} cy={n.y} r={on ? 4.5 : 3} fill={n.color} />
                    <text
                      x={n.x + 10}
                      y={n.y + 3.5}
                      fill={on ? "#e8e6e1" : "#a9a7a1"}
                      fontSize="11"
                      fontFamily="var(--font-mono)"
                      style={{ userSelect: "none" }}
                    >
                      {n.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* tooltip */}
            <AnimatePresence>
              {hover && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-none absolute z-10 border border-line-2 bg-ink px-3 py-2 font-mono text-[11px]"
                  style={{
                    left: `${(hover.x / W) * 100}%`,
                    top: `${(hover.y / H) * 100}%`,
                    transform: "translate(-50%, calc(-100% - 18px))",
                  }}
                >
                  <div className="text-bone">{hover.name}</div>
                  <div className="mt-0.5 text-[9px] tracking-[0.16em] uppercase" style={{ color: hover.color }}>
                    {hover.group}
                  </div>
                  <div className="mt-1 text-[10px] text-bone-3">
                    {hover.links.length ? hover.links.map((l) => linkTargets[l].label).join(" · ") : "Toolbox"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>

      {/* compact index for small screens and screen readers */}
      <Reveal>
        <div className="grid gap-6 sm:grid-cols-2">
          {skillGroups.map((g) => (
            <div key={g}>
              <div className="label mb-2" style={{ color: groupStyle[g].color }}>
                {g}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[12px] text-bone-2">
                {skills
                  .filter((s) => s.group === g)
                  .map((s) => (
                    <span key={s.name} className={cn(hover?.name === s.name && "text-bone")}>
                      {s.name}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </RevealGroup>
  );
}
