"use client";

import { profile } from "@/data/profile";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";

export function AboutSection() {
  return (
    <RevealGroup className="space-y-10">
      <Reveal>
        <div className="label mb-3">Operator profile</div>
        <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-bone md:text-5xl">
          {profile.name}
        </h2>
        <p className="mt-3 font-mono text-[12px] tracking-[0.16em] text-bone-2 uppercase">{profile.title}</p>
      </Reveal>

      <Reveal>
        <p className="max-w-2xl text-lg leading-relaxed text-bone md:text-xl">{profile.about.lead}</p>
      </Reveal>

      <Reveal>
        <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-bone-2 md:text-base">
          {profile.about.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-[1fr_1fr]">
          <div>
            <div className="label mb-4">Focus areas</div>
            <ul className="space-y-2">
              {profile.about.interests.map((i, idx) => (
                <li key={i} className="flex items-baseline gap-3 font-mono text-[13px] text-bone">
                  <span className="text-[10px] text-bone-3">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="tracking-[0.06em]">{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="label mb-4">System</div>
            <dl className="space-y-2 font-mono text-[12px]">
              <Row k="STATUS" v="Building" accent />
              <Row k="BASE" v={profile.location} />
              <Row k="INSTITUTION" v={profile.education.school} />
              <Row k="GPA" v={profile.education.gpa} />
              <Row k="GRADUATION" v={profile.education.graduation} />
            </dl>
          </div>
        </div>
      </Reveal>
    </RevealGroup>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex gap-4 border-b border-line/60 pb-2">
      <dt className="w-28 shrink-0 tracking-[0.14em] text-bone-3">{k}</dt>
      <dd className={accent ? "text-accent" : "text-bone"}>{v}</dd>
    </div>
  );
}
