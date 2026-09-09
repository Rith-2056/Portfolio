export function Scanlines() {
  return (
    <>
      <div aria-hidden className="scanlines pointer-events-none fixed inset-0 z-[60]" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[59]"
        style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
      />
    </>
  );
}
