import { useEffect, useId, useRef } from 'react';
import { OTHER, type Question } from '../survey.config';
import { choicesFor, keyLetter, selectedValues, type Answers } from '../lib/answers';
import { Button, EnterHint } from './Button';
import { ArrowRightIcon, ArrowUpIcon, Spinner } from './Icons';
import { OptionCard } from './OptionCard';

interface Props {
  question: Question;
  number: number;
  sectionTitle: string;
  answers: Answers;
  error: string | null;
  /** Cambia a ogni errore per far ripartire l'animazione. */
  errorKey: number;
  confirming: string | null;
  isLast: boolean;
  sending: boolean;
  sendError: boolean;
  onText: (text: string) => void;
  onOtherText: (text: string) => void;
  onChoose: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const inputClass =
  'w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-lg text-white placeholder:text-mist/60 transition focus:border-sea focus:bg-white/[0.07] focus:outline-none';

export function QuestionScreen(props: Props) {
  const { question, number, sectionTitle, answers, error, errorKey, isLast, sending } = props;
  const titleId = useId();
  const errorId = useId();
  const otherId = useId();
  const textRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  const isText = question.type === 'short' || question.type === 'paragraph';
  const multi = question.type === 'multi';
  const selected = selectedValues(answers, question.id);
  const otherSelected = selected.includes(OTHER);

  // All'apertura della domanda il focus va al campo di testo o al titolo,
  // così chi usa uno screen reader sente subito la domanda.
  useEffect(() => {
    if (isText) textRef.current?.focus({ preventScroll: true });
    else titleRef.current?.focus({ preventScroll: true });
  }, [isText, question.id]);

  // Quando si sceglie "Altro" il campo di testo compare e prende il focus.
  useEffect(() => {
    if (otherSelected) otherRef.current?.focus({ preventScroll: true });
  }, [otherSelected]);

  const describedBy = error ? errorId : undefined;
  const nextLabel = isLast ? 'Invia risposte' : multi ? 'Continua' : 'Avanti';

  return (
    <div className="w-full">
      <p className="mb-3 text-sm font-semibold tracking-wide text-sea uppercase">{sectionTitle}</p>
      <h2
        id={titleId}
        ref={titleRef}
        tabIndex={-1}
        className="flex gap-3 text-2xl leading-tight font-bold text-balance focus:outline-none sm:text-3xl"
      >
        <span
          aria-hidden
          className="mt-1.5 flex shrink-0 items-center gap-1 self-start text-base text-rose sm:mt-2.5"
        >
          {number}
          <ArrowRightIcon className="size-4" />
        </span>
        <span>
          {question.title}
          {question.required ? (
            <>
              <span aria-hidden className="text-rose">
                {' '}
                *
              </span>
              <span className="sr-only"> (obbligatoria)</span>
            </>
          ) : (
            <span className="ml-2 align-middle text-sm font-medium text-mist">(facoltativa)</span>
          )}
        </span>
      </h2>
      {multi && <p className="mt-2 text-mist">Puoi scegliere più risposte.</p>}

      <div className="mt-7">
        {isText &&
          (question.type === 'paragraph' ? (
            <textarea
              ref={textRef}
              rows={4}
              aria-labelledby={titleId}
              aria-describedby={describedBy}
              aria-required={question.required}
              aria-invalid={!!error}
              placeholder="Scrivi qui la tua risposta…"
              value={(answers.values[question.id] as string | undefined) ?? ''}
              onChange={(e) => props.onText(e.target.value)}
              className={`${inputClass} resize-none`}
            />
          ) : (
            <input
              ref={textRef}
              type="text"
              aria-labelledby={titleId}
              aria-describedby={describedBy}
              aria-required={question.required}
              aria-invalid={!!error}
              autoComplete={question.id === 'nome' ? 'given-name' : 'off'}
              enterKeyHint={isLast ? 'send' : 'next'}
              placeholder="Scrivi qui la tua risposta…"
              value={(answers.values[question.id] as string | undefined) ?? ''}
              onChange={(e) => props.onText(e.target.value)}
              className={inputClass}
            />
          ))}

        {!isText && (
          <div
            role={multi ? 'group' : 'radiogroup'}
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            aria-required={question.required}
            className="flex flex-col gap-3"
          >
            {choicesFor(question).map((option, index) => (
              <OptionCard
                key={option.value}
                option={option}
                letter={keyLetter(index)}
                multi={multi}
                selected={selected.includes(option.value)}
                confirming={props.confirming === option.value}
                onSelect={() => props.onChoose(option.value)}
              />
            ))}

            {otherSelected && (
              <div className="animate-fade">
                <label htmlFor={otherId} className="sr-only">
                  Specifica la tua risposta per &quot;Altro&quot;
                </label>
                <input
                  id={otherId}
                  ref={otherRef}
                  type="text"
                  aria-required
                  aria-invalid={error !== null && !(answers.others[question.id] ?? '').trim()}
                  enterKeyHint="next"
                  placeholder="Scrivi la tua risposta…"
                  value={answers.others[question.id] ?? ''}
                  onChange={(e) => props.onOtherText(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div aria-live="assertive" className="min-h-7">
        {error && (
          <p
            key={errorKey}
            id={errorId}
            className="mt-4 inline-flex animate-shake items-center gap-2 rounded-xl bg-rose/15 px-4 py-2 text-sm font-medium text-[#ff8aa0]"
          >
            <span aria-hidden>⚠</span> {error}
          </p>
        )}
      </div>

      {props.sendError && (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-rose/40 bg-rose/10 px-5 py-4 text-sm leading-relaxed"
        >
          Non siamo riusciti a inviare le risposte. Controlla la connessione e riprova: le tue
          risposte sono salvate su questo dispositivo.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={props.onBack} disabled={sending}>
          <ArrowUpIcon className="size-5 -rotate-90" />
          Indietro
        </Button>
        <Button onClick={props.onNext} disabled={sending} className="flex-1 sm:flex-none">
          {sending ? (
            <>
              <Spinner /> Invio in corso…
            </>
          ) : (
            <>
              {props.sendError ? 'Riprova a inviare' : nextLabel}
              <ArrowRightIcon className="size-5" />
            </>
          )}
        </Button>
        {!sending && (
          <EnterHint
            label={
              question.type === 'paragraph' ? 'Invio ↵ (Maiusc+Invio per andare a capo)' : 'Invio ↵'
            }
          />
        )}
      </div>
    </div>
  );
}
