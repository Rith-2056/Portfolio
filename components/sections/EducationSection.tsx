"use client";

import { profile } from "@/data/profile";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";

export function EducationSection() {
  const e = profile.education;
  return (
    <RevealGroup className="space-y-8">
      <Reveal>
        <div className="label mb-3">Academic record</div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-bone md:text-4xl">Education</h2>
      </Reveal>

      <Reveal>
        <div className="corners border border-line bg-ink-2/60 p-6 md:p-8">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-bone-3">
            <span>TRANSCRIPT</span>
            <span className="text-signal">VERIFIED</span>
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-bone">{e.school}</h3>
          <p className="mt-1 text-[15px] text-bone-2">{e.degree}</p>
          <dl className="mt-6 grid gap-4 font-mono text-[12px] sm:grid-cols-2">
            <div className="border-t border-line pt-3">
              <dt className="tracking-[0.16em] text-bone-3">GPA</dt>
              <dd className="mt-1 text-xl text-accent">{e.gpa}</dd>
            </div>
            <div className="border-t border-line pt-3">
              <dt className="tracking-[0.16em] text-bone-3">EXPECTED GRADUATION</dt>
              <dd className="mt-1 text-xl text-bone">{e.graduation}</dd>
            </div>
          </dl>
        </div>
      </Reveal>

      <Reveal>
        <div className="label mb-3">Awards</div>
        <ul className="divide-y divide-line border-y border-line">
          {profile.awards.map((a, i) => (
            <li key={a} className="flex items-baseline gap-4 py-3 font-mono text-[13px] text-bone">
              <span className="text-[10px] tracking-[0.16em] text-bone-3">{String(i + 1).padStart(2, "0")}</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </RevealGroup>
  );
}
