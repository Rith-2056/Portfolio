"use client";

import { motion, AnimatePresence } from "framer-motion";
import { profile } from "@/data/profile";
import { useStore } from "@/lib/store";

const ease = [0.16, 1, 0.3, 1] as const;

export function Intro() {
  const phase = useStore((s) => s.phase);
  const enter = useStore((s) => s.enterWorld);
  const show = phase === "intro";

  return (
    <AnimatePresence>
      {show && (
        <motion.section
          key="intro"
          className="fixed inset-0 z-[40] flex items-end p-6 md:items-center md:p-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          aria-label="Introduction"
        >
          {/* left gradient so type stays legible over the world */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent md:via-ink/40" />
          <div className="relative max-w-2xl">
            <motion.div
              className="mb-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-bone-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease }}
            >
              <span className="inline-block h-1.5 w-1.5 bg-signal" />
              PORTFOLIO // v1.0 // UMASS AMHERST
            </motion.div>
            <motion.h1
              className="font-display text-[clamp(2.4rem,7vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-bone"
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 1.1, ease }}
            >
              DIVYARITH
              <br />
              SHIVASHOK
            </motion.h1>
            <motion.p
              className="mt-5 font-mono text-[12px] tracking-[0.2em] text-bone-2 uppercase md:text-[13px]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.9, ease }}
            >
              {profile.title}
            </motion.p>
            <motion.p
              className="mt-6 max-w-md text-[17px] leading-relaxed text-bone-2 md:text-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.9, ease }}
            >
              {profile.tagline}
            </motion.p>
            <motion.div
              className="mt-10 flex items-center gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.9, ease }}
            >
              <button
                onClick={enter}
                autoFocus
                data-interactive
                className="group relative inline-flex items-center gap-3 border border-bone/30 px-5 py-3 font-mono text-[12px] tracking-[0.24em] text-bone transition-colors hover:border-accent hover:text-accent"
              >
                <span className="absolute -left-px -top-px h-2 w-2 border-l border-t border-accent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-accent opacity-0 transition-opacity group-hover:opacity-100" />
                EXPLORE
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
              <span className="hidden font-mono text-[10px] tracking-[0.18em] text-bone-3 md:inline">or press ENTER</span>
            </motion.div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
