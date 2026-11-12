import { gsap } from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createLogoAnimation, type LogoFormat } from '../brand/logo-animation.js';
import { prefersReducedMotion } from './motion';

// Ripresa da apps/web/src/pages/home/hero-intro.ts del sito (branch feature/rebranding).

const STORAGE_KEY = 'solo-survey:intro-vista';

/** Secondo della timeline in cui il logo comincia a ridursi (l'animazione dura 8 s). */
export const SHRINK_AT = 7.3;

/** L'intro animata si vede una volta per sessione. */
export function isIntroSeen(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Storage non disponibile: l'intro ripartirà alla prossima visita, nessun danno.
  }
}

/** Formato dell'animazione più vicino alle proporzioni dello schermo. */
export function pickFormat(width: number, height: number): LogoFormat {
  const ratio = height > 0 ? width / height : 16 / 9;
  if (ratio >= 1.25) return '16:9';
  if (ratio <= 0.8) return '9:16';
  return '1:1';
}

export type IntroPhase = 'intro' | 'done';

/**
 * L'animazione del logo occupa tutto lo schermo; alla fine nome e slogan si riducono fino al
 * logo statico della schermata iniziale (transizione FLIP: l'ultimo fotogramma coincide con il
 * file SVG).
 */
export function useLogoIntro() {
  const stageRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const fromRect = useRef<DOMRect | null>(null);
  const [phase, setPhase] = useState<IntroPhase>(() =>
    isIntroSeen() || prefersReducedMotion() ? 'done' : 'intro',
  );

  const finish = useCallback((from: DOMRect | null) => {
    fromRect.current = from;
    markIntroSeen();
    setPhase('done');
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (phase !== 'intro' || !stage) return;

    let animation: ReturnType<typeof createLogoAnimation>;
    try {
      animation = createLogoAnimation(gsap, stage, {
        format: pickFormat(stage.clientWidth, stage.clientHeight),
        background: false,
      });
    } catch {
      // Animazione non disponibile (browser senza geometria SVG): si mostra subito il logo.
      const frame = requestAnimationFrame(() => finish(null));
      return () => cancelAnimationFrame(frame);
    }
    animation.timeline.call(() => finish(animation.lockupRect()), undefined, SHRINK_AT);
    return () => animation.destroy();
  }, [phase, finish]);

  // Da dove era il logo nell'animazione a dove sta nella pagina, senza salti
  useLayoutEffect(() => {
    const from = fromRect.current;
    const logo = logoRef.current;
    fromRect.current = null;
    if (phase !== 'done' || !from || !logo || typeof logo.animate !== 'function') return;
    const to = logo.getBoundingClientRect();
    if (!to.width) return;
    const scale = from.width / to.width;
    logo.animate(
      [
        {
          transformOrigin: '0 0',
          transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${scale})`,
        },
        { transformOrigin: '0 0', transform: 'none' },
      ],
      { duration: 1100, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
    );
  }, [phase]);

  return { phase, stageRef, logoRef, skip: () => finish(null) };
}
