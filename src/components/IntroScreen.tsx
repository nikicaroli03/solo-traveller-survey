import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
// Logo ufficiale senza slogan: ha la stessa larghezza e la stessa origine della versione con
// slogan con cui finisce l'animazione, quindi la riduzione finale combacia (lo slogan sparisce).
import logoUrl from '../assets/solo-travellers-dark.svg';
import { intro } from '../survey.config';
import { useLogoIntro } from '../lib/logo-intro';
import { isTouchDevice } from '../lib/motion';
import { totalQuestions } from '../lib/steps';
import { Button, EnterHint } from './Button';
import { ArrowRightIcon } from './Icons';

/**
 * Schermata iniziale. Alla prima visita della sessione l'animazione del logo occupa tutto lo
 * schermo; alla fine nome e slogan si riducono fino al logo in cima alla pagina e compaiono
 * testo e pulsante.
 */
export function IntroScreen({ onStart }: { onStart: () => void }) {
  const { phase, stageRef, logoRef, skip } = useLogoIntro();
  const playing = phase === 'intro';
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!playing && !isTouchDevice()) buttonRef.current?.focus({ preventScroll: true });
  }, [playing]);

  return (
    <div className="w-full">
      {/* Nel body: dentro la schermata (che ha un'animazione di transform) "fixed" non
          coprirebbe tutto lo schermo */}
      {playing &&
        createPortal(
          <div className="brand-backdrop fixed inset-0 z-40">
            <div ref={stageRef} className="absolute inset-0" />
            <button
              type="button"
              onClick={skip}
              className="absolute right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] z-10 rounded-full border border-cream/25 bg-cream/10 px-4 py-2 text-sm font-medium text-cream/90 backdrop-blur transition-colors hover:bg-cream/20"
            >
              Salta l'animazione
            </button>
          </div>,
          document.body,
        )}

      {/* Durante l'animazione il contenuto occupa già il suo posto ma resta invisibile e inattivo */}
      <div inert={playing}>
        <h1 className={playing ? 'opacity-0' : undefined}>
          <img ref={logoRef} src={logoUrl} alt="Solo Travellers" className="w-[min(78vw,420px)]" />
        </h1>
        <div
          className={`transition-all duration-700 ${playing ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100 delay-700'}`}
        >
          <p className="mt-10 inline-flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1 text-sm font-semibold text-orange">
            Questionario · {totalQuestions} domande · circa 5 minuti
          </p>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-mist sm:text-xl">{intro.text}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button ref={buttonRef} onClick={onStart} className="px-8 text-lg">
              Inizia
              <ArrowRightIcon className="size-5" />
            </Button>
            <EnterHint />
          </div>
        </div>
      </div>
    </div>
  );
}
