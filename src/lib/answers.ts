import { OTHER, type Option, type Question } from '../survey.config';

/** Opzioni mostrate a schermo, con "Altro" in fondo se la domanda lo prevede. */
export function choicesFor(question: Question): Option[] {
  const options = question.options ?? [];
  return question.other ? [...options, { value: OTHER, label: 'Altro' }] : options;
}

/** Lettera della scorciatoia da tastiera per l'opzione in posizione `index` (A, B, C…). */
export const keyLetter = (index: number) => String.fromCharCode(65 + index);

/** Risposta a una domanda: testo o opzione singola (string) oppure caselle (string[]). */
export type AnswerValue = string | string[];

export interface Answers {
  values: Record<string, AnswerValue>;
  /** Testo libero dell'opzione "Altro", per id della domanda. */
  others: Record<string, string>;
}

export const emptyAnswers = (): Answers => ({ values: {}, others: {} });

/** Opzioni selezionate come lista, qualunque sia il tipo di domanda. */
export function selectedValues(answers: Answers, questionId: string): string[] {
  const value = answers.values[questionId];
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

/**
 * Aggiunge o toglie un'opzione da una domanda a caselle. Un'opzione `exclusive`
 * ("Non pagherei per nessuna funzione") deseleziona tutte le altre, e viceversa.
 */
export function toggleMulti(question: Question, current: string[], value: string): string[] {
  if (current.includes(value)) return current.filter((v) => v !== value);

  const exclusive = new Set(question.options?.filter((o) => o.exclusive).map((o) => o.value));
  if (exclusive.has(value)) return [value];
  return [...current.filter((v) => !exclusive.has(v)), value];
}

export type ValidationError = 'required' | 'other';

export function validate(question: Question, answers: Answers): ValidationError | null {
  if (question.type === 'short' || question.type === 'paragraph') {
    const text = answers.values[question.id];
    const empty = typeof text !== 'string' || text.trim() === '';
    return question.required && empty ? 'required' : null;
  }

  const selected = selectedValues(answers, question.id);
  if (question.required && selected.length === 0) return 'required';
  if (selected.includes(OTHER) && !(answers.others[question.id] ?? '').trim()) return 'other';
  return null;
}

export function errorMessage(question: Question, error: ValidationError): string {
  if (error === 'other') return 'Scrivi due parole nel campo "Altro" per continuare.';
  if (question.type === 'multi') return "Scegli almeno un'opzione: ci serve la tua risposta.";
  if (question.type === 'single') return 'Scegli una risposta per continuare.';
  return 'Questa domanda è obbligatoria: scrivi la tua risposta per continuare.';
}
