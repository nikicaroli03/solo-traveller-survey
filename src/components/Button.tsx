import type { ComponentProps } from 'react';

type Variant = 'primary' | 'ghost';

const styles: Record<Variant, string> = {
  primary:
    'bg-sea text-ink shadow-[0_8px_30px_-8px_rgb(93_224_230/0.6)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgb(93_224_230/0.8)] active:translate-y-0',
  ghost: 'border border-white/15 text-white hover:border-white/35 hover:bg-white/5',
};

interface Props extends ComponentProps<'button'> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-base font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

/** Suggerimento "premi Invio", mostrato solo su schermi con tastiera (desktop). */
export function EnterHint({ label = 'Invio ↵' }: { label?: string }) {
  return (
    <span className="hidden text-sm text-mist sm:inline">
      premi <kbd className="font-sans font-semibold text-white">{label}</kbd>
    </span>
  );
}
