"use client";

import { projects, type Project } from "@/data/projects";
import { Chip } from "@/components/ui/Chip";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";

function Glyph({ kind }: { kind: Project["artifact"] }) {
  const stroke = "#5fe0c8";
  if (kind === "browser") {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-20" fill="none" stroke={stroke} strokeWidth="1.2">
        <rect x="4" y="6" width="88" height="60" rx="2" />
        <line x1="4" y1="18" x2="92" y2="18" />
        <circle cx="11" cy="12" r="1.6" fill="#ff6a1f" stroke="none" />
        <circle cx="17" cy="12" r="1.6" />
        <circle cx="23" cy="12" r="1.6" />
        <rect x="12" y="26" width="34" height="6" opacity="0.6" />
        <rect x="12" y="38" width="52" height="4" opacity="0.4" />
        <rect x="12" y="46" width="44" height="4" opacity="0.4" />
        <rect x="64" y="52" width="18" height="8" fill="#ff6a1f" stroke="none" opacity="0.9" />
      </svg>
    );
  }
  if (kind === "terminal") {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-20" fill="none" stroke={stroke} strokeWidth="1.2">
        <rect x="8" y="8" width="80" height="56" rx="2" />
        <path d="M18 24 l8 6 -8 6" />
        <line x1="30" y1="36" x2="44" y2="36" />
        <line x1="18" y1="46" x2="52" y2="46" opacity="0.5" />
        <line x1="18" y1="52" x2="40" y2="52" opacity="0.5" />
        <rect x="42" y="49" width="5" height="6" fill="#ff6a1f" stroke="none" />
        <circle cx="78" cy="18" r="2" fill="#ff6a1f" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 96 72" className="h-16 w-20" fill="none" stroke={stroke} strokeWidth="1.2">
      {[
        [20, 20],
        [76, 18],
        [14, 54],
        [80, 56],
        [50, 62],
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1="48" y1="36" x2={x} y2={y} opacity="0.5" />
          <circle cx={x} cy={y} r="3" />
        </g>
      ))}
      <line x1="20" y1="20" x2="76" y2="18" opacity="0.3" />
      <line x1="14" y1="54" x2="50" y2="62" opacity="0.3" />
      <circle cx="48" cy="36" r="5" fill="#ff6a1f" stroke="none" />
    </svg>
  );
}

export function ProjectsSection() {
  return (
    <RevealGroup className="space-y-8">
      <Reveal>
        <div className="label mb-3">Workshop inventory</div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-bone md:text-4xl">Projects</h2>
      </Reveal>

      <div className="divide-y divide-line border-y border-line">
        {projects.map((p, i) => (
          <Reveal key={p.id}>
            <article className="group grid gap-6 py-8 md:grid-cols-[110px_1fr]">
              <div>
                <div className="font-mono text-[10px] tracking-[0.16em] text-bone-3">ARTIFACT {String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 opacity-80 transition-opacity group-hover:opacity-100">
                  <Glyph kind={p.artifact} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-bone">{p.name}</h3>
                  <span className="font-mono text-[10px] tracking-[0.16em] text-bone-3 uppercase">{p.kind}</span>
                </div>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-bone-2">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.technologies.map((t) => (
                    <Chip key={t} accent>
                      {t}
                    </Chip>
                  ))}
                </div>
                <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-baseline gap-3 font-mono text-[12.5px] text-bone">
                      <span className="mt-[2px] h-1 w-1 shrink-0 bg-signal" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </RevealGroup>
  );
}
