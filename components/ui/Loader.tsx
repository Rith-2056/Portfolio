"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const lines = [
  "mounting island geometry",
  "compiling shaders",
  "spawning rover",
  "linking zones",
  "calibrating camera",
];

export function Loader({ done }: { done: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => Math.min(lines.length - 1, v + 1)), 380);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink grid-bg"
      initial={{ opacity: 1 }}
      animate={{ opacity: done ? 0 : 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ pointerEvents: done ? "none" : "auto" }}
      aria-live="polite"
    >
      <div className="w-64">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-bone-3">
          <span>BOOT</span>
          <span className="text-accent">RITH.OS</span>
        </div>
        <div className="mt-3 h-px w-full bg-line">
          <motion.div
            className="h-px bg-accent"
            initial={{ width: "0%" }}
            animate={{ width: done ? "100%" : `${20 + i * 15}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="mt-3 font-mono text-[11px] text-bone-2">
          <span className="text-bone-3">&gt; </span>
          {done ? "ready" : lines[i]}
          <span className="caret" />
        </div>
      </div>
    </motion.div>
  );
}
