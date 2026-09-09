"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { zoneById } from "@/data/zones";

export function InteractPrompt({ coarse = false }: { coarse?: boolean }) {
  const near = useStore((s) => s.nearZone);
  const phase = useStore((s) => s.phase);
  const open = useStore((s) => s.openSection);
  const show = phase === "explore" && near;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[35] flex justify-center md:bottom-16">
      <AnimatePresence>
        {show && (
          <motion.button
            key={near}
            onClick={() => open(near)}
            data-interactive
            className="pointer-events-auto flex items-center gap-3 border border-accent/60 bg-ink/80 px-4 py-2.5 font-mono text-[12px] tracking-[0.2em] text-bone backdrop-blur-sm"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-block h-2 w-2 rounded-full bg-accent" style={{ animation: "pulse-ring 1.4s ease-out infinite" }} />
              <span className="relative inline-block h-2 w-2 rounded-full bg-accent" />
            </span>
            {coarse ? "TAP TO OPEN" : <><span className="text-accent">[E]</span> INTERACT</>}
            <span className="text-bone-3">·</span>
            <span className="text-bone-2">{zoneById[near].description.toUpperCase()}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
