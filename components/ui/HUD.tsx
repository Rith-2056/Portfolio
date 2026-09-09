"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { zones, zoneById } from "@/data/zones";
import { cn } from "@/lib/cn";

function Nav() {
  const phase = useStore((s) => s.phase);
  const active = useStore((s) => s.activeSection);
  const visited = useStore((s) => s.visited);
  const openSection = useStore((s) => s.openSection);
  const closeSection = useStore((s) => s.closeSection);
  const enter = useStore((s) => s.enterWorld);
  const canNav = phase !== "loading";

  return (
    <nav aria-label="Sections" className="pointer-events-auto flex flex-col items-end gap-1 font-mono text-[11px] tracking-[0.2em]">
      <button
        onClick={() => (phase === "section" ? closeSection() : phase === "intro" ? enter() : undefined)}
        data-interactive
        className={cn(
          "px-1 py-0.5 transition-colors",
          phase === "explore" ? "text-accent" : "text-bone-2 hover:text-accent",
        )}
        aria-current={phase === "explore" ? "true" : undefined}
      >
        [EXPLORE]
      </button>
      {zones
        .filter((z) => z.inNav)
        .map((z) => {
          const on = active === z.id;
          const seen = visited.includes(z.id);
          return (
            <button
              key={z.id}
              onClick={() => openSection(z.id, { teleport: true })}
              data-interactive
              disabled={!canNav}
              className={cn(
                "group flex items-center gap-2 px-1 py-0.5 transition-colors disabled:opacity-40",
                on ? "text-accent" : "text-bone-2 hover:text-bone",
              )}
              aria-current={on ? "page" : undefined}
            >
              <span className={cn("h-1 w-1 transition-colors", on ? "bg-accent" : seen ? "bg-signal" : "bg-line-2 group-hover:bg-bone-3")} />
              {z.navLabel}
            </button>
          );
        })}
    </nav>
  );
}

function Coordinates() {
  const x = useStore((s) => s.roverX);
  const z = useStore((s) => s.roverZ);
  const speed = useStore((s) => s.roverSpeed);
  const near = useStore((s) => s.nearZone);
  const fmt = (v: number) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(1).padStart(5, "0");
  return (
    <div className="font-mono text-[10px] tracking-[0.18em] text-bone-3">
      <div className="flex gap-4">
        <span>
          X <span className="text-bone-2">{fmt(x)}</span>
        </span>
        <span>
          Z <span className="text-bone-2">{fmt(z)}</span>
        </span>
        <span>
          V <span className="text-bone-2">{speed.toFixed(1).padStart(4, "0")}</span>
        </span>
      </div>
      <div className="mt-1 h-px w-40 bg-line">
        <div className="h-px bg-signal transition-[width] duration-150" style={{ width: `${Math.min(100, (speed / 14) * 100)}%` }} />
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className={cn("inline-block h-1.5 w-1.5", near ? "bg-accent" : "bg-line-2")} />
        <span className={near ? "text-accent" : ""}>{near ? `${zoneById[near].code} ${zoneById[near].label.toUpperCase()}` : "OPEN GROUND"}</span>
      </div>
    </div>
  );
}

function Controls({ coarse }: { coarse: boolean }) {
  return (
    <div className="hidden font-mono text-[10px] tracking-[0.18em] text-bone-3 md:block">
      {coarse ? (
        <div>DRAG STICK TO MOVE · TAP OBJECTS TO OPEN</div>
      ) : (
        <div className="flex flex-col items-end gap-1">
          <div>
            <K>W</K>
            <K>A</K>
            <K>S</K>
            <K>D</K> MOVE
          </div>
          <div>
            <K>SHIFT</K> BOOST · <K>E</K> INTERACT
          </div>
          <div>DRAG TO ORBIT · SCROLL TO ZOOM</div>
        </div>
      )}
    </div>
  );
}

function K({ children }: { children: React.ReactNode }) {
  return <kbd className="mr-1 inline-block border border-line-2 px-1 py-px text-[9px] text-bone-2">{children}</kbd>;
}

export function HUD({ coarse = false }: { coarse?: boolean }) {
  const phase = useStore((s) => s.phase);
  const tier = useStore((s) => s.perfTier);
  const inWorld = phase === "explore" || phase === "section";
  const dim = phase === "section";

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[55]"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "loading" ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* top-left: identity + status */}
      <div className={cn("absolute left-5 top-5 transition-opacity duration-500 md:left-8 md:top-7", dim && "opacity-40")}>
        <div className="font-mono text-[11px] tracking-[0.24em] text-bone">RITH.OS</div>
        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-bone-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal blink" />
          SYS ONLINE · {tier.toUpperCase()} · 42.39°N 72.53°W
        </div>
      </div>

      {/* top-right: navigation */}
      <div className={cn("absolute right-5 top-5 transition-opacity duration-500 md:right-8 md:top-7", phase === "intro" && "opacity-70")}>
        <Nav />
      </div>

      {/* bottom-left: coordinates */}
      <div className={cn("absolute bottom-5 left-5 transition-opacity duration-500 md:bottom-7 md:left-8", (!inWorld || dim) && "opacity-0")}>
        <Coordinates />
      </div>

      {/* bottom-right: controls */}
      <div className={cn("absolute bottom-5 right-5 text-right transition-opacity duration-500 md:bottom-7 md:right-8", (!inWorld || dim) && "opacity-0")}>
        <Controls coarse={coarse} />
      </div>
    </motion.div>
  );
}
