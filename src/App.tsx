import { useEffect, useRef, useState } from 'react';
import { OTHER, sections } from './survey.config';
import {
  choicesFor,
  emptyAnswers,
  errorMessage,
  selectedValues,
  toggleMulti,
  validate,
  type Answers,
} from './lib/answers';
import { prefersReducedMotion } from './lib/motion';
import { questionsBefore, steps, totalQuestions } from './lib/steps';
import {
  clearProgress,
  isSubmitted,
  loadProgress,
  markSubmitted,
  saveProgress,
} from './lib/storage';
import { submitAnswers } from './lib/submit';
import { Background } from './components/Background';
import { EndScreen } from './components/EndScreen';
import { IntroScreen } from './components/IntroScreen';
import { ProgressBar } from './components/ProgressBar';
import { QuestionScreen } from './components/QuestionScreen';
import { SectionScreen } from './components/SectionScreen';

type Phase = 'survey' | 'done' | 'already';

const lastStep = steps.length - 1;
const clampStep = (n: number) => Math.min(Math.max(0, Math.floor(n)), lastStep);

export function App() {
  const [saved] = useState(loadProgress);
  const [phase, setPhase] = useState<Phase>(() => (isSubmitted() ? 'already' : 'survey'));
  const [answers, setAnswers] = useState<Answers>(() => saved?.answers ?? emptyAnswers());
  const [step, setStep] = useState(() => clampStep(saved?.step ?? 0));
  const [direction, setDirection] = useState<1 | -1>(1);
  const [resumed, setResumed] = useState(() => phase === 'survey' && step > 0);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const advanceTimer = useRef<number | undefined>(undefined);

  // Le risposte in corso restano nel browser: chi chiude la pagina riprende da qui.
  useEffect(() => {
    if (phase === 'survey') saveProgress({ answers, step });
  }, [answers, step, phase]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const current = steps[step] ?? steps[0]!;

  function go(to: number) {
    window.clearTimeout(advanceTimer.current);
    setConfirming(null);
    setError(null);
    setSendError(false);
    setResumed(false);
    setDirection(to > step ? 1 : -1);
    setStep(clampStep(to));
    window.scrollTo({ top: 0 });
  }

  async function send() {
    if (sending) return;
    setSending(true);
    setSendError(false);
    try {
      await submitAnswers(answers);
      markSubmitted();
      clearProgress();
      setPhase('done');
      window.scrollTo({ top: 0 });
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  }

  function next() {
    if (sending) return;
    if (current.kind === 'question') {
      const problem = validate(current.question, answers);
      if (problem) {
        setError(errorMessage(current.question, problem));
        setErrorKey((k) => k + 1);
        return;
      }
      if (step === lastStep) {
        void send();
        return;
      }
    }
    go(step + 1);
  }

  const back = () => step > 0 && go(step - 1);

  function setValue(id: string, value: Answers['values'][string]) {
    setAnswers((a) => ({ ...a, values: { ...a.values, [id]: value } }));
    setError(null);
  }

  function choose(value: string) {
    if (current.kind !== 'question') return;
    const question = current.question;

    if (question.type === 'multi') {
      setValue(question.id, toggleMulti(question, selectedValues(answers, question.id), value));
      return;
    }

    setValue(question.id, value);
    // Con "Altro" si resta sulla domanda: va scritto il testo prima di continuare.
    if (value === OTHER || step === lastStep) return;
    setConfirming(value);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(
      () => go(step + 1),
      prefersReducedMotion() ? 150 : 450,
    );
  }

  // Tastiera: Invio per avanzare, lettere (A, B, C…) per scegliere le opzioni.
  useEffect(() => {
    if (phase !== 'survey') return;

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      const role = target.getAttribute('role');

      if (e.key === 'Enter') {
        if (tag === 'TEXTAREA' && e.shiftKey) return; // a capo nel paragrafo
        // Sulle card delle opzioni Invio conferma la domanda invece di ricliccare l'opzione;
        // sugli altri pulsanti e link resta il comportamento normale del browser.
        if ((tag === 'BUTTON' || tag === 'A') && role !== 'radio' && role !== 'checkbox') return;
        e.preventDefault();
        next();
        return;
      }

      if (tag === 'INPUT' || tag === 'TEXTAREA' || current.kind !== 'question') return;
      if (e.key.length !== 1) return;
      const option = choicesFor(current.question)[e.key.toUpperCase().charCodeAt(0) - 65];
      if (option) {
        e.preventDefault();
        choose(option.value);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  let screen;
  if (phase !== 'survey') {
    screen = <EndScreen justSubmitted={phase === 'done'} />;
  } else if (current.kind === 'intro') {
    screen = <IntroScreen onStart={next} />;
  } else if (current.kind === 'section') {
    screen = (
      <SectionScreen
        number={current.section + 1}
        title={sections[current.section]?.title ?? ''}
        onNext={next}
        onBack={back}
      />
    );
  } else {
    const question = current.question;
    screen = (
      <QuestionScreen
        question={question}
        number={current.number}
        sectionTitle={sections[current.section]?.title ?? ''}
        answers={answers}
        error={error}
        errorKey={errorKey}
        confirming={confirming}
        isLast={step === lastStep}
        sending={sending}
        sendError={sendError}
        onText={(text) => setValue(question.id, text)}
        onOtherText={(text) => {
          setAnswers((a) => ({ ...a, others: { ...a.others, [question.id]: text } }));
          setError(null);
        }}
        onChoose={choose}
        onNext={next}
        onBack={back}
      />
    );
  }

  return (
    <>
      <Background />
      <ProgressBar
        done={phase === 'survey' ? questionsBefore(step) : totalQuestions}
        total={totalQuestions}
        current={phase === 'survey' && current.kind === 'question' ? current.number : undefined}
      />
      <main className="mx-auto flex min-h-dvh w-full max-w-2xl items-center px-5 pt-24 pb-[calc(env(safe-area-inset-bottom,0px)+3rem)] sm:px-8">
        <div
          key={`${phase}-${step}`}
          className={`w-full ${direction > 0 ? 'animate-step-up' : 'animate-step-down'}`}
        >
          {resumed && (
            <p
              role="status"
              className="mb-6 inline-block rounded-xl border border-orange/30 bg-orange/10 px-4 py-2 text-sm"
            >
              Bentornatə! Abbiamo ripreso da dove eri rimastə.
            </p>
          )}
          {screen}
        </div>
      </main>
    </>
  );
}
