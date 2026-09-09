import { cn } from "@/lib/cn";

export function Chip({ children, accent, className }: { children: React.ReactNode; accent?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase",
        accent ? "border-accent/50 text-accent" : "border-line-2 text-bone-2",
        className,
      )}
    >
      {children}
    </span>
  );
}
