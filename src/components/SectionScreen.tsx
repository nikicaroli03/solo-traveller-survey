import { useEffect, useRef } from 'react';
import { isTouchDevice } from '../lib/motion';
import { Button, EnterHint } from './Button';
import { ArrowRightIcon, ArrowUpIcon } from './Icons';
import { MeetingScene } from './MeetingScene';

interface Props {
  number: number;
  title: string;
  onNext: () => void;
  onBack: () => void;
}

/** Schermata di passaggio tra una sezione e l'altra. */
export function SectionScreen({ number, title, onNext, onBack }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isTouchDevice()) buttonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="w-full">
      <MeetingScene className="-ml-2 mb-8" />
      <p className="text-sm font-semibold tracking-wide text-orange uppercase">Sezione {number}</p>
      <h2 className="mt-3 text-4xl leading-tight font-extrabold text-balance sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-lg text-mist">
        Ottimo, la prima parte è fatta! Adesso qualche domanda sulla piattaforma.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowUpIcon className="size-5 -rotate-90" />
          Indietro
        </Button>
        <Button ref={buttonRef} onClick={onNext} className="flex-1 sm:flex-none">
          Continua
          <ArrowRightIcon className="size-5" />
        </Button>
        <EnterHint />
      </div>
    </div>
  );
}
