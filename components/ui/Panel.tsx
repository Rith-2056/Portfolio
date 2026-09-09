"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { zones, zoneById, type ZoneId } from "@/data/zones";
import { AboutSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { cn } from "@/lib/cn";

function SectionBody({ id }: { id: ZoneId }) {
  switch (id) {
    case "about":
      return <AboutSection />;
    case "experience":
      return <ExperienceSection initial="fisheye" />;
    case "research":
      return <ExperienceSection initial="daros" />;
    case "projects":
      return <ProjectsSection />;
    case "skills":
      return <SkillsSection />;
    case "education":
      return <EducationSection />;
    case "contact":
      return <ContactSection />;
  }
}

const order: ZoneId[] = ["about", "experience", "research", "projects", "skills", "education", "contact"];

/**
 * Full-screen 2D information interface that materialises over the world
 * when a location is activated.
 */
export function Panel({ blur = true }: { blur?: boolean }) {
  const active = useStore((s) => s.activeSection);
  const close = useStore((s) => s.closeSection);
  const open = useStore((s) => s.openSection);
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const id = window.setTimeout(() => panel.current?.focus(), 50);
    if (scroller.current) scroller.current.scrollTop = 0;
    document.body.dataset.panel = "open";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
      delete document.body.dataset.panel;
      prev?.focus?.();
    };
  }, [active, close]);

  const zone = active ? zoneById[active] : null;
  const idx = active ? order.indexOf(active) : -1;
  const next = idx >= 0 ? order[(idx + 1) % order.length] : null;
  const prevId = idx >= 0 ? order[(idx - 1 + order.length) % order.length] : null;

  return (
    <AnimatePresence>
      {active && zone && (
        <motion.div
          key={active}
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="panel-title"
          className="fixed inset-0 z-[50] outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          transition={{ duration: 0.4 }}
        >
          {/* backdrop */}
          <motion.div
            className={cn("absolute inset-0 grid-bg", blur ? "bg-ink/88 backdrop-blur-[3px]" : "bg-ink")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* close control (bottom-right so it never collides with the nav) */}
          <motion.div
            className="pointer-events-none absolute bottom-5 right-5 z-10 md:bottom-7 md:right-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <button
              onClick={close}
              data-interactive
              className="pointer-events-auto border border-line-2 bg-ink/80 px-3 py-1.5 font-mono text-[11px] tracking-[0.2em] text-bone-2 transition-colors hover:border-accent hover:text-accent"
              aria-label="Close and return to the world"
            >
              [ESC] CLOSE
            </button>
          </motion.div>

          {/* content */}
          <motion.div
            ref={scroller}
            className="scroll-thin absolute inset-0 overflow-y-auto overscroll-contain scroll-smooth"
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99, transition: { duration: 0.3 } }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mx-auto min-h-full max-w-5xl px-5 pb-28 pt-24 md:px-12 md:pb-32 md:pt-28">
              <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[10px] tracking-[0.2em] text-bone-3">
                <span>
                  <span className="text-accent">{zone.code}</span> · {zone.label.toUpperCase()}
                </span>
                <span>
                  POS {zone.position[0] >= 0 ? "+" : ""}
                  {zone.position[0].toFixed(1)} / {zone.position[1] >= 0 ? "+" : ""}
                  {zone.position[1].toFixed(1)}
                </span>
                <span className="text-signal">LINK ESTABLISHED</span>
              </div>
              <div className="relative border-l border-line pl-6 md:pl-12">
                <span className="absolute -left-px top-0 h-16 w-px bg-accent" />
                <h2 id="panel-title" className="sr-only">
                  {zone.description}
                </h2>
                <SectionBody id={active} />
              </div>

              {/* footer navigation */}
              <div className="mt-20 flex items-center justify-between border-t border-line pt-6 font-mono text-[11px] tracking-[0.2em]">
                <button onClick={() => prevId && open(prevId, { teleport: true })} data-interactive className="text-bone-3 transition-colors hover:text-bone">
                  ← {prevId && zoneById[prevId].description.toUpperCase()}
                </button>
                <span className="text-bone-3">
                  {String(idx + 1).padStart(2, "0")} / {String(zones.length).padStart(2, "0")}
                </span>
                <button onClick={() => next && open(next, { teleport: true })} data-interactive className="text-bone-2 transition-colors hover:text-accent">
                  {next && zoneById[next].description.toUpperCase()} →
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
