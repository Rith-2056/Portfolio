"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experiences } from "@/data/experience";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Chip } from "@/components/ui/Chip";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";

type Props = { initial?: string };

export function ExperienceSection({ initial = "fisheye" }: Props) {
  const [active, setActive] = useState(initial);
  const setHighlight = useStore((s) => s.setHighlight);
  const exp = experiences.find((e) => e.id === active) ?? experiences[0];

  useEffect(() => setActive(initial), [initial]);
  useEffect(() => () => setHighlight(null), [setHighlight]);

  return (
    <RevealGroup className="space-y-8">
      <Reveal>
        <div className="label mb-3">Timeline</div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-bone md:text-4xl">Experience</h2>
      </Reveal>

      <Reveal>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* rail */}
          <nav aria-label="Experience entries" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {experiences.map((e, i) => {
              const on = e.id === active;
              return (
                <button
                  key={e.id}
                  onClick={() => setActive(e.id)}
                  data-interactive
                  className={cn(
                    "group relative min-w-[180px] border-l-2 px-3 py-2 text-left transition-colors lg:min-w-0",
                    on ? "border-accent" : "border-line hover:border-bone-3",
                  )}
                  aria-current={on ? "true" : undefined}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-bone-3">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn(e.status === "current" ? "text-signal" : "")}>{e.status === "current" ? "ACTIVE" : "ARCHIVED"}</span>
                  </div>
                  <div className={cn("mt-1 font-display text-[15px] font-medium", on ? "text-bone" : "text-bone-2 group-hover:text-bone")}>
                    {e.company.split(" — ")[0]}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.08em] text-bone-3">{e.period}</div>
                </button>
              );
            })}
          </nav>

          {/* content */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-bone md:text-3xl">{exp.company}</h3>
                  <span className="font-mono text-[11px] tracking-[0.14em] text-bone-3">{exp.period}</span>
                </div>
                <p className="mt-1 font-mono text-[12px] tracking-[0.1em] text-accent uppercase">{exp.role}</p>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-bone-2">{exp.summary}</p>

                <div className="mt-8 divide-y divide-line border-y border-line">
                  {exp.accomplishments.map((a, i) => (
                    <div
                      key={a.id}
                      className="group grid gap-3 py-5 transition-colors hover:bg-ink-2/70 md:grid-cols-[150px_1fr] md:gap-6"
                      onMouseEnter={() => setHighlight(i)}
                      onMouseLeave={() => setHighlight(null)}
                      onFocus={() => setHighlight(i)}
                      onBlur={() => setHighlight(null)}
                      tabIndex={0}
                    >
                      <div className="flex items-start gap-3 md:block">
                        <div className="font-mono text-[10px] tracking-[0.16em] text-bone-3">
                          {exp.kind === "industry" && exp.id === "fisheye" ? `RACK ${String(i + 1).padStart(2, "0")}` : `UNIT ${String(i + 1).padStart(2, "0")}`}
                        </div>
                        <div className="font-mono text-2xl font-medium leading-none text-accent md:mt-2 md:text-3xl">{a.metric}</div>
                        <div className="mt-1 font-mono text-[10px] tracking-[0.12em] text-bone-3 uppercase">{a.metricLabel}</div>
                      </div>
                      <div>
                        <p className="text-[15px] leading-relaxed text-bone">{a.text}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {a.tags.map((t) => (
                            <Chip key={t}>{t}</Chip>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </RevealGroup>
  );
}
