import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import { Figure, FOOT } from './Traveller';

gsap.registerPlugin(MotionPathPlugin);

const ROUTES = [
  { d: 'M-60 650C250 520 420 770 700 610S1100 430 1270 530', dur: 46, reverse: false },
  { d: 'M-60 170C200 260 380 70 640 165S1010 300 1270 130', dur: 58, reverse: true },
];

/**
 * Fondo del marchio (blu notte con trama di punti) e, molto discrete, due rotte tratteggiate
 * che scorrono con una piccola L-persona che le percorre.
 */
export function Background() {
  const [still] = useState(prefersReducedMotion);
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = root.current;
    if (still || !svg) return;
    const ctx = gsap.context(() => {
      ROUTES.forEach((route, i) => {
        const path = svg.querySelector<SVGPathElement>(`[data-route="${i}"]`);
        const walker = svg.querySelector(`[data-walker="${i}"]`);
        if (!path || !walker) return;
        gsap.to(walker, {
          motionPath: {
            path,
            align: path,
            alignOrigin: [0.5, 1],
            start: route.reverse ? 1 : 0,
            end: route.reverse ? 0 : 1,
          },
          duration: route.dur,
          repeat: -1,
          ease: 'none',
          // Ognuna parte da un punto diverso del suo giro
          delay: -route.dur * (i ? 0.6 : 0.25),
        });
      });
    }, svg);
    return () => ctx.revert();
  }, [still]);

  return (
    <div
      aria-hidden
      className="brand-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -right-48 -bottom-56 size-[34rem] rounded-full bg-orange/10 blur-[140px]" />
      <div className="absolute -top-56 -left-40 size-[30rem] rounded-full bg-[#2a4a72]/40 blur-[130px]" />

      <svg
        ref={root}
        className="absolute inset-0 size-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {ROUTES.map((route, i) => (
          <g key={route.d}>
            <path
              data-route={i}
              d={route.d}
              fill="none"
              stroke="#fff8ef"
              strokeOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="10 12"
              strokeLinecap="round"
              className={still ? undefined : 'animate-march'}
            />
            {!still && (
              <g data-walker={i} fill="#ff7a2f" opacity={0.45}>
                <g transform="scale(0.4)">
                  <Figure
                    transform={route.reverse ? `translate(${FOOT} 0) scale(-1 1)` : undefined}
                  />
                </g>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
