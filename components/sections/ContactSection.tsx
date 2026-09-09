"use client";

import { useState } from "react";
import { profile } from "@/data/profile";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";

const links = [
  { k: "EMAIL", label: profile.email, href: `mailto:${profile.email}` },
  { k: "LINKEDIN", label: profile.linkedinLabel, href: profile.linkedin },
  { k: "GITHUB", label: profile.githubLabel, href: profile.github },
];

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <RevealGroup className="flex min-h-[50vh] flex-col justify-center space-y-10">
      <Reveal>
        <div className="mb-4 flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] text-bone-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal blink" />
          <span>TX CHANNEL OPEN</span>
        </div>
        <h2 className="font-display text-4xl font-semibold leading-[1] tracking-tight text-bone md:text-6xl">
          LET&apos;S BUILD
          <br />
          SOMETHING
        </h2>
      </Reveal>

      <Reveal>
        <ul className="max-w-lg divide-y divide-line border-y border-line">
          {links.map((l) => (
            <li key={l.k}>
              <a
                href={l.href}
                target={l.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                data-interactive
                className="group flex items-center justify-between gap-6 py-4 transition-colors hover:text-accent"
              >
                <span className="font-mono text-[11px] tracking-[0.18em] text-bone-3 group-hover:text-accent">{l.k}</span>
                <span className="font-mono text-[14px] text-bone group-hover:text-accent">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal>
        <button
          onClick={copy}
          data-interactive
          className="font-mono text-[11px] tracking-[0.16em] text-bone-3 transition-colors hover:text-bone"
        >
          {copied ? "[ COPIED ]" : "[ COPY EMAIL ]"}
        </button>
      </Reveal>
    </RevealGroup>
  );
}
