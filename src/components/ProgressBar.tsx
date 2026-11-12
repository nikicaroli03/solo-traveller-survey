import { LinkedPair, TravellerIcon } from './Traveller';

interface Props {
  /** Domande già completate. */
  done: number;
  total: number;
  /** Numero della domanda mostrata, se la schermata è una domanda. */
  current?: number;
}

/**
 * Barra di avanzamento: due L-persone partono dai due capi della rotta tratteggiata e a ogni
 * risposta si avvicinano; all'ultima si incontrano e si collegano, come nel logo.
 */
export function ProgressBar({ done, total, current }: Props) {
  const half = (done / total) * 50;
  const complete = done >= total;

  return (
    <header className="fixed inset-x-0 top-0 z-20 bg-night/70 px-4 pt-[calc(env(safe-area-inset-top,0px)+0.6rem)] pb-2.5 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-2xl items-center gap-4">
        <div
          className="relative h-8 flex-1"
          role="progressbar"
          aria-label="Avanzamento del questionario"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          aria-valuetext={`${done} domande su ${total} completate`}
        >
          <div className="route absolute inset-x-0 bottom-1 h-0.5 rounded-full" />
          <div
            className="absolute bottom-1 left-0 h-0.5 rounded-full bg-orange transition-[width] duration-700 ease-out"
            style={{ width: `${half}%` }}
          />
          <div
            className="absolute right-0 bottom-1 h-0.5 rounded-full bg-orange transition-[width] duration-700 ease-out"
            style={{ width: `${half}%` }}
          />

          {complete ? (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
              <span className="absolute -inset-3 animate-link-pulse rounded-full bg-orange/40" />
              <LinkedPair className="relative h-6 animate-pop text-orange" />
            </div>
          ) : (
            <>
              {/* key: a ogni avanzamento il passo ricomincia */}
              <div
                className="absolute bottom-1 transition-[left] duration-700 ease-out"
                style={{ left: `calc(${half}% - 4px)` }}
              >
                <TravellerIcon key={done} className="h-6 animate-walk text-orange" />
              </div>
              <div
                className="absolute bottom-1 transition-[right] duration-700 ease-out"
                style={{ right: `calc(${half}% - 4px)` }}
              >
                <TravellerIcon key={done} flip className="h-6 animate-walk text-orange" />
              </div>
            </>
          )}
        </div>
        <p className="min-w-[8.5rem] text-right text-sm font-medium text-mist tabular-nums">
          {current ? (
            <>
              Domanda <span className="text-cream">{current}</span> di {total}
            </>
          ) : complete ? (
            <span className="text-orange">Completato ✓</span>
          ) : (
            `${total} domande`
          )}
        </p>
      </div>
    </header>
  );
}
