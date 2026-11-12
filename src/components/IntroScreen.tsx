import { useEffect, useRef } from 'react';
import { intro } from '../survey.config';
import { isTouchDevice } from '../lib/motion';
import { totalQuestions } from '../lib/steps';
import { Button, EnterHint } from './Button';
import { ArrowRightIcon, PlaneIcon } from './Icons';

/** "Solo traveLLers" con le due L evidenziate, come nel brand. */
export function BrandTitle({ text }: { text: string }) {
  const [before, after] = text.split('LL');
  if (after === undefined) return <>{text}</>;
  return (
    <>
      {before}
      <span className="bg-gradient-to-r from-sea to-rose bg-clip-text text-transparent">LL</span>
      {after}
    </>
  );
}

export function IntroScreen({ onStart }: { onStart: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isTouchDevice()) buttonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="w-full">
      <div className="mb-8 flex size-14 items-center justify-center rounded-2xl border border-sea/30 bg-sea/10">
        <PlaneIcon className="size-7 text-sea" />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
        <BrandTitle text={intro.title} />
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist sm:text-xl">{intro.text}</p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button ref={buttonRef} onClick={onStart} className="px-8 text-lg">
          Inizia
          <ArrowRightIcon className="size-5" />
        </Button>
        <EnterHint />
      </div>
      <p className="mt-6 text-sm text-mist">⏱ circa 5 minuti · {totalQuestions} domande</p>
    </div>
  );
}
