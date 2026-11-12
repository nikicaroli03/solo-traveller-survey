import { useEffect, useRef } from 'react';
import { MVP_URL, outro } from '../survey.config';
import { launchConfetti } from '../lib/confetti';
import { prefersReducedMotion } from '../lib/motion';
import { ArrowRightIcon, CheckIcon } from './Icons';
import { ShareButtons } from './ShareButtons';

interface Props {
  /** true: la survey è appena stata inviata (con coriandoli); false: era già stata inviata. */
  justSubmitted: boolean;
}

export function EndScreen({ justSubmitted }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
    if (!justSubmitted || prefersReducedMotion() || !canvasRef.current) return;
    return launchConfetti(canvasRef.current);
  }, [justSubmitted]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 size-full"
      />
      <div className="mb-8 flex size-16 animate-pop items-center justify-center rounded-full bg-orange text-night shadow-[0_0_40px_rgb(255_122_47/0.5)]">
        <CheckIcon className="size-8" />
      </div>

      {justSubmitted ? (
        <>
          <h1
            ref={titleRef}
            tabIndex={-1}
            className="text-4xl leading-tight font-extrabold text-balance focus:outline-none sm:text-5xl"
          >
            {outro.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-mist sm:text-xl">{outro.text}</p>
        </>
      ) : (
        <>
          <h1
            ref={titleRef}
            tabIndex={-1}
            className="text-4xl leading-tight font-extrabold text-balance focus:outline-none sm:text-5xl"
          >
            Hai già compilato il questionario
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-mist sm:text-xl">
            Abbiamo già ricevuto le tue risposte da questo dispositivo: grazie davvero per il tuo
            aiuto!
          </p>
        </>
      )}

      <a
        href={MVP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-orange/40 bg-orange/10 px-5 py-4 transition duration-200 hover:-translate-y-0.5 hover:bg-orange/15"
      >
        <span>
          <span className="block font-bold">Prova la piattaforma</span>
          <span className="block text-sm text-mist">Scopri il prototipo di Solo Travellers</span>
        </span>
        <ArrowRightIcon className="size-5 shrink-0 text-orange" />
      </a>

      <div className="mt-8">
        <ShareButtons />
      </div>
    </div>
  );
}
