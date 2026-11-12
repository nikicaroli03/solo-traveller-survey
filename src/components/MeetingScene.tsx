import { gsap } from 'gsap';
import { useEffect, useId, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import { FOOT, Figure, LINK_FOOT, PAIR_GAP, footPath } from './Traveller';

const START = 170;
const ROUTE_LEFT = 'M-195 10C-140 -26 -80 30 -6 10';
const ROUTE_RIGHT = `M${PAIR_GAP + 250} 10C${PAIR_GAP + 190} 40 ${PAIR_GAP + 130} -16 ${PAIR_GAP + 50} 10`;

function play(svg: SVGSVGElement) {
  const q = gsap.utils.selector(svg);
  const linkFoot = q('[data-figure="left"] [data-part="foot"]');

  if (prefersReducedMotion()) {
    gsap.set(q('[data-reveal]'), { attr: { 'stroke-dashoffset': 0 } });
    gsap.set(linkFoot, { attr: { d: footPath(LINK_FOOT) } });
    return;
  }

  gsap
    .timeline({ delay: 0.25 })
    .to(q('[data-reveal]'), { attr: { 'stroke-dashoffset': 0 }, duration: 0.9, ease: 'none' }, 0)
    .from(q('[data-walker="left"]'), { x: -START, duration: 1.7, ease: 'power1.inOut' }, 0.3)
    .from(q('[data-walker="right"]'), { x: START, duration: 1.7, ease: 'power1.inOut' }, 0.3)
    .to(q('[data-bob]'), { y: -6, duration: 0.17, yoyo: true, repeat: 9, ease: 'sine.inOut' }, 0.3)
    .to(q('[data-route]'), { opacity: 0.25, duration: 0.6 }, 1.8)
    .to(linkFoot, { attr: { d: footPath(LINK_FOOT) }, duration: 0.35, ease: 'power2.out' }, 2.05)
    .fromTo(
      q('[data-pulse]'),
      { scale: 0.2, opacity: 0.9, transformOrigin: '50% 50%' },
      { scale: 4, opacity: 0, duration: 0.9, ease: 'power2.out', immediateRender: false },
      2.2,
    )
    .to(
      q('[data-pair]'),
      { y: -8, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.out' },
      2.25,
    );
}

/**
 * "Leave solo, Link together." in piccolo: le due L-persone arrivano lungo due rotte
 * tratteggiate, si incontrano e il piede della prima passa sotto la seconda (il Link).
 */
export function MeetingScene({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    // Il contesto annulla tutto all'uscita: rimontando, la scena riparte dalla posizione giusta.
    const ctx = gsap.context(() => play(svg), svg);
    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={root}
      viewBox="-205 -125 530 155"
      className={`w-full max-w-md text-orange ${className}`}
      fill="currentColor"
      aria-hidden
    >
      <defs>
        {[ROUTE_LEFT, ROUTE_RIGHT].map((d, i) => (
          // Area esplicita: quella predefinita taglierebbe la rotta a sinistra dell'origine
          <mask
            key={d}
            id={`${id}-m${i}`}
            maskUnits="userSpaceOnUse"
            x={-205}
            y={-125}
            width={530}
            height={155}
          >
            <path
              data-reveal
              d={d}
              fill="none"
              stroke="#fff"
              strokeWidth={8}
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          </mask>
        ))}
      </defs>
      {[ROUTE_LEFT, ROUTE_RIGHT].map((d, i) => (
        <path
          key={d}
          data-route
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeDasharray="7 7"
          strokeLinecap="round"
          mask={`url(#${id}-m${i})`}
        />
      ))}
      <circle
        data-pulse
        cx={PAIR_GAP + 6}
        cy={-8}
        r={12}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        opacity={0}
      />
      <g data-pair>
        <g data-walker="left">
          <g data-bob>
            <Figure data-figure="left" foot={FOOT} />
          </g>
        </g>
        <g data-walker="right">
          <g data-bob>
            <Figure foot={110.2 - PAIR_GAP} transform={`translate(${PAIR_GAP} 0)`} />
          </g>
        </g>
      </g>
    </svg>
  );
}
