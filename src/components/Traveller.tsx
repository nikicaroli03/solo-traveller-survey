import type { SVGProps } from 'react';

// Le L-persone del logo (brand/logo/mark-orange.svg del progetto principale), in unità del logo:
// asta larga 15,84, testa di raggio 10,77 spostata in avanti, piede che parte dall'asta.
// L'origine è l'angolo in basso a sinistra dell'asta; l'asse y va verso l'alto (valori negativi).

export const STEM = 15.84;
const HEAD = { cx: 14.26, cy: -90.23, r: 10.77 };
/** Lunghezza del piede di una figura "da sola" (nel logo la prima arriva a 82,82: il Link). */
export const FOOT = 44;
/** Distanza tra le due figure nel logo. */
export const PAIR_GAP = 59.06;
/** Piede della prima figura nel logo, che passa sotto la seconda. */
export const LINK_FOOT = 82.82;
/** Fine del piede della seconda figura nel logo. */
const RIGHT_FOOT = 110.2 - PAIR_GAP;

/** Asta con la cima tonda e l'angolo esterno arrotondato (raggio = asta). */
const STEM_PATH = `M0 -66.79A7.92 7.92 0 0 1 ${STEM} -66.79V0H${STEM}A${STEM} ${STEM} 0 0 1 0 -${STEM}Z`;

/** Piede dall'asta fino a `length`, con la punta tonda. Stessa struttura per ogni lunghezza. */
export function footPath(length: number) {
  const end = length - 7.92;
  return `M${STEM} -${STEM}H${end}A7.92 7.92 0 0 1 ${end} 0H${STEM}Z`;
}

interface FigureProps extends SVGProps<SVGGElement> {
  foot?: number;
}

/** Una L-persona, da usare dentro un <svg>. Guarda (e cammina) verso destra. */
export function Figure({ foot = FOOT, ...props }: FigureProps) {
  return (
    <g {...props}>
      <circle data-part="head" {...HEAD} />
      <path data-part="stem" d={STEM_PATH} />
      <path data-part="foot" d={footPath(foot)} />
    </g>
  );
}

/** Una L-persona singola come icona (es. nella barra di avanzamento). */
export function TravellerIcon({
  flip = false,
  ...props
}: SVGProps<SVGSVGElement> & { flip?: boolean }) {
  return (
    <svg viewBox="-4 -104 52 108" fill="currentColor" aria-hidden {...props}>
      <Figure transform={flip ? `translate(${FOOT} 0) scale(-1 1)` : undefined} />
    </svg>
  );
}

/** Le due L-persone collegate che saltano di gioia, a turno (schermata finale). */
export function CelebratingPair(props: SVGProps<SVGSVGElement>) {
  const hop = (delay: number) => ({
    transformBox: 'fill-box' as const,
    animationDelay: `${delay}s`,
    animationIterationCount: 4,
  });
  return (
    <svg viewBox="-4 -130 118 134" fill="currentColor" aria-hidden {...props}>
      {/* La seconda è disegnata prima: nel salto della prima, il piede del Link le passa davanti */}
      <g transform={`translate(${PAIR_GAP} 0)`}>
        <g className="animate-hop" style={hop(0.45)}>
          <Figure foot={RIGHT_FOOT} />
        </g>
      </g>
      <g className="animate-hop" style={hop(0.15)}>
        <Figure foot={LINK_FOOT} />
      </g>
    </svg>
  );
}

/** Le due L-persone collegate, come nel logo. */
export function LinkedPair(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-4 -104 118 108" fill="currentColor" aria-hidden {...props}>
      <Figure foot={LINK_FOOT} />
      <Figure foot={RIGHT_FOOT} transform={`translate(${PAIR_GAP} 0)`} />
    </svg>
  );
}
