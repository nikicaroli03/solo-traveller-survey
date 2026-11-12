import { PlaneIcon } from './Icons';

interface Props {
  /** Domande già completate. */
  done: number;
  total: number;
  /** Numero della domanda mostrata, se la schermata è una domanda. */
  current?: number;
}

/** Barra di avanzamento: una rotta tratteggiata su cui un aereo avanza a ogni domanda. */
export function ProgressBar({ done, total, current }: Props) {
  const percent = Math.round((done / total) * 100);

  return (
    <header className="fixed inset-x-0 top-0 z-20 bg-ink/70 px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-2xl items-center gap-4">
        <div
          className="relative h-6 flex-1"
          role="progressbar"
          aria-label="Avanzamento del questionario"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          aria-valuetext={`${done} domande su ${total} completate`}
        >
          <div className="route absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full" />
          <div
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-sea to-rose transition-[width] duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700 ease-out"
            style={{ left: `${percent}%` }}
          >
            <PlaneIcon className="size-5 rotate-45 text-sea drop-shadow-[0_0_8px_rgb(93_224_230/0.7)]" />
          </div>
        </div>
        <p className="min-w-[8.5rem] text-right text-sm font-medium text-mist tabular-nums">
          {current ? (
            <>
              Domanda <span className="text-white">{current}</span> di {total}
            </>
          ) : done === total ? (
            <span className="text-sea">Completato ✓</span>
          ) : (
            `${total} domande`
          )}
        </p>
      </div>
    </header>
  );
}
