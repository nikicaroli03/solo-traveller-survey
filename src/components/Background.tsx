/** Fondo del marchio (blu notte con trama di punti) e un alone arancio molto leggero. */
export function Background() {
  return (
    <div
      aria-hidden
      className="brand-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -right-48 -bottom-56 size-[34rem] rounded-full bg-orange/10 blur-[140px]" />
      <div className="absolute -top-56 -left-40 size-[30rem] rounded-full bg-[#2a4a72]/40 blur-[130px]" />
    </div>
  );
}
