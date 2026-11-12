/** Sfondo scuro con sfumature luminose (turchese e rosa) e texture a puntini. */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div className="absolute -top-40 -left-32 size-[34rem] rounded-full bg-sea/20 blur-[120px]" />
      <div className="absolute -right-40 -bottom-48 size-[36rem] rounded-full bg-rose/15 blur-[130px]" />
      <div className="absolute top-1/3 left-1/2 size-[22rem] -translate-x-1/2 rounded-full bg-sea/5 blur-[100px]" />
      <div className="dots absolute inset-0" />
    </div>
  );
}
